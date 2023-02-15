import React, { memo, useCallback, useEffect, useReducer } from "react";
import reducer, { closeAllModals, closeModal, initialState, openModal } from "./reducer";

const _DefaultModalContext = {
  showModal: (options) => {},
  hideModal: (options) => {},
  hideAllModals: () => {}
}

const _DefaultModal = () => <>Modal Component not provided</>;

const ModalContext = React.createContext(_DefaultModalContext);
ModalContext.displayName = 'ModalContext';

export function ModalContextProvider({
  children,
  modalComponents = {},
  Modal,
}) {

  useEffect(() => {
    console.log('mounting')
    return () => console.log('un mounting')
  }, [])

  const [state, dispatch] = useReducer(reducer, initialState);

  const validateModalType = useCallback(
    (type) => {
      if(!type) {
        console.error('please provide a valid modal type');
        return false;
      }
      if(!(type in modalComponents)) {
        console.error(`'${type}' is not registered as a modal`);
        return false;
      }
      if(!modalComponents[type]) {
        console.error(`'${type}' is not a valid in React Component`);
        return false;
      }
      return true;
    },
    []
  )

  const showModal = useCallback(
    ({ type, props = {} }) => {
      if(validateModalType(type)) {
        dispatch(openModal(type, { props }))
      }
    },
    []
  )

  const hideModal = useCallback(
    ({ type }) => {
      dispatch(closeModal(type))
    },
    []
  )

  const hideAllModals = useCallback(
    () => {
      dispatch(closeAllModals());
    },
    []
  )

  const getScreenByType = useCallback(
    (type) => {
      if(modalComponents[type]) {
        return modalComponents[type]
      }
      return _DefaultModal;
    },
    []
  )


  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        hideAllModals,
      }}
    >
      {children}
      {state.modals.map(
        (modalState, index) => {
          if(!Modal) {
            console.error(`Please provide valid 'Modal' prop`, modalState);
            return null;
          }
          const { open, modalType: type, props = {} } = modalState;
          const { modalProps, ...bodyProps } = (props || {})
          const ModalBody = getScreenByType(type);
          return (
            <Modal
              {...(modalProps || {})}
              key={`modal-component-${type}-${index}`}
              open={Boolean(open)}
              onClose={() => hideModal({ type })}
            >
              <ModalBody {...(bodyProps || {})} />
            </Modal>
          );
        }
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal hook must be used within a ModalContextProvider')
  }
  return context
}
