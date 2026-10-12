import React, { useCallback, useEffect, useId, useLayoutEffect, useReducer, useRef } from "react";
import reducer, { bringModalToFront, closeModal, initialState, openModal, updateModal } from "./reducer";
import DefaultModal from "./DefaultModal";

const ModalContext = React.createContext(null);
ModalContext.displayName = 'ModalContext';
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function ModalContextProvider({
  children,
  modalComponents = {},
  Modal,
  defaultOptions = {},
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const providerId = useId();
  const nextInstanceId = useRef(0);
  const previousModals = useRef([]);
  const previousLifecycleModals = useRef([]);
  const pendingCloses = useRef(new Set());
  const closeReasons = useRef(new Map());
  const openedCallbacks = useRef(new Set());
  const modalComponentsRef = useRef(modalComponents);
  modalComponentsRef.current = modalComponents;
  const modalsRef = useRef(state.modals);
  modalsRef.current = state.modals;

  useIsomorphicLayoutEffect(() => {
    const previous = previousModals.current;
    const currentIds = new Set(state.modals.map((modal) => modal.instanceId));
    const previousTop = previous[previous.length - 1];
    if (previousTop && !currentIds.has(previousTop.instanceId)) {
      const focusTarget = state.modals.length
        ? previousTop.returnFocusElement
        : previous[0]?.returnFocusElement;
      if (focusTarget?.isConnected) focusTarget.focus();
    }
    previousModals.current = state.modals;
  }, [state.modals]);

  useEffect(() => {
    const previous = previousLifecycleModals.current;
    const currentIds = new Set(state.modals.map((modal) => modal.instanceId));

    previous.forEach((modal) => {
      if (currentIds.has(modal.instanceId)) return;
      const event = {
        id: modal.instanceId,
        type: modal.modalType,
        reason: closeReasons.current.get(modal.instanceId) || 'programmatic',
      };
      modal.options.onClose?.(event);
      closeReasons.current.delete(modal.instanceId);
      pendingCloses.current.delete(modal.instanceId);
      openedCallbacks.current.delete(modal.instanceId);
    });

    const topModal = state.modals[state.modals.length - 1];
    if (topModal && !openedCallbacks.current.has(topModal.instanceId)) {
      openedCallbacks.current.add(topModal.instanceId);
      topModal.options.onAfterOpen?.({ id: topModal.instanceId, type: topModal.modalType });
    }

    previousLifecycleModals.current = state.modals;
  }, [state.modals]);

  const showModal = useCallback(({ type, props = {}, modalProps = {}, ...options }) => {
    const ModalBody = modalComponentsRef.current[type];
    if (!type || !Object.prototype.hasOwnProperty.call(modalComponentsRef.current, type) ||
      (!ModalBody || (typeof ModalBody !== 'function' && typeof ModalBody !== 'object'))) {
      throw new TypeError(`No valid modal component is registered for type "${type || ''}".`);
    }
    const instanceId = `${providerId}-${nextInstanceId.current++}`;
    const { modalProps: legacyModalProps, ...bodyProps } = props || {};
    dispatch(openModal(instanceId, type, {
      returnFocusElement: typeof document === 'undefined' ? null : document.activeElement,
      props: bodyProps,
      modalProps: { ...(legacyModalProps || {}), ...modalProps },
      options: { ...defaultOptions, ...options },
    }));
    return instanceId;
  }, [defaultOptions, providerId]);

  const requestClose = useCallback((modal, reason = 'programmatic') => {
    if (!modal || pendingCloses.current.has(modal.instanceId)) return Promise.resolve(false);
    pendingCloses.current.add(modal.instanceId);
    const event = { id: modal.instanceId, type: modal.modalType, reason };
    let decision;
    try {
      decision = modal.options.onBeforeClose?.(event);
    } catch (error) {
      pendingCloses.current.delete(modal.instanceId);
      modal.options.onCloseError?.(error, event);
      return Promise.resolve(false);
    }

    const finishClose = (allowed) => {
      if (allowed === false || !modalsRef.current.some((item) => item.instanceId === modal.instanceId)) {
        pendingCloses.current.delete(modal.instanceId);
        return false;
      }
      closeReasons.current.set(modal.instanceId, reason);
      dispatch(closeModal({ instanceId: modal.instanceId }));
      return true;
    };
    const handleError = (error) => {
      pendingCloses.current.delete(modal.instanceId);
      modal.options.onCloseError?.(error, event);
      return false;
    };

    if (!decision || typeof decision.then !== 'function') {
      return Promise.resolve(finishClose(decision));
    }
    return decision.then(finishClose, handleError);
  }, []);

  const hideModal = useCallback(({ id, instanceId, type, reason = 'programmatic' } = {}) => {
    const targetId = id || instanceId;
    const matchingModals = modalsRef.current.filter((modal) => {
      if (targetId) return modal.instanceId === targetId;
      if (type) return modal.modalType === type;
      return false;
    });
    const closeResults = matchingModals.map((modal) => requestClose(modal, reason));
    if (closeResults.length === 1) return closeResults[0];
    return Promise.all(closeResults);
  }, [requestClose]);

  const hideAllModals = useCallback(() => Promise.all(
    modalsRef.current.map((modal) => requestClose(modal, 'programmatic'))
  ), [requestClose]);

  const closeTopModal = useCallback(() => {
    const topModal = modalsRef.current[modalsRef.current.length - 1];
    return requestClose(topModal, 'programmatic');
  }, [requestClose]);

  const updateModalById = useCallback(({ id, props, modalProps, options } = {}) => {
    if (!id || !modalsRef.current.some((modal) => modal.instanceId === id)) return false;
    dispatch(updateModal(id, { props, modalProps, options }));
    return true;
  }, []);

  const bringToFront = useCallback(({ id } = {}) => {
    if (!id || !modalsRef.current.some((modal) => modal.instanceId === id)) return false;
    dispatch(bringModalToFront(id));
    return true;
  }, []);

  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        hideAllModals,
        closeTopModal,
        updateModal: updateModalById,
        bringToFront,
      }}
    >
      {children}
      {state.modals.map(({ instanceId, modalType, props, modalProps, options }, index) => {
        const ModalBody = modalComponentsRef.current[modalType];
        const ModalShell = Modal || DefaultModal;
        return (
          <ModalShell
            {...modalProps}
            {...options}
            key={instanceId}
            modalId={instanceId}
            isTopmost={index === state.modals.length - 1}
            open
            onClose={(reason) => requestClose(
              modalsRef.current.find((modal) => modal.instanceId === instanceId),
              reason
            )}
          >
            <ModalBody {...props} modalId={instanceId} />
          </ModalShell>
        );
      })}
    </ModalContext.Provider>
  )
}

export { DefaultModal };

export function useModal() {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal hook must be used within a ModalContextProvider')
  }
  if (context === null) {
    throw new Error('useModal must be used within a ModalContextProvider');
  }
  return context
}
