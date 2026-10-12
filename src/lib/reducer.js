export const initialState = {
  modals: [],
};

const actions = {
  OPEN_MODAL: 'open_modal',
  CLOSE_MODAL: 'close_modal',
  CLOSE_ALL: 'close_all',
  UPDATE_MODAL: 'update_modal',
  BRING_TO_FRONT: 'bring_to_front',
}


export const openModal = (instanceId, modalType, passedState) => ({
  type: actions.OPEN_MODAL,
  instanceId,
  modalType,
  ...passedState
});

export const closeModal = ({ instanceId, modalType }) => ({
  type: actions.CLOSE_MODAL,
  instanceId,
  modalType
});

export const closeAllModals = () => ({
  type: actions.CLOSE_ALL,
});

export const updateModal = (instanceId, changes) => ({
  type: actions.UPDATE_MODAL,
  instanceId,
  changes,
});

export const bringModalToFront = (instanceId) => ({
  type: actions.BRING_TO_FRONT,
  instanceId,
});

function reducer(state, action) {
  switch(action.type) {
    case actions.OPEN_MODAL: {
      const { instanceId, modalType, props, modalProps, options, returnFocusElement } = action;
      if (!instanceId || !modalType) return state;
      return {
        ...state,
        modals: [...state.modals, {
          instanceId,
          modalType,
          props,
          modalProps,
          options,
          returnFocusElement,
        }],
      };
    }
    case actions.CLOSE_MODAL: {
      const { instanceId, modalType } = action;
      const modals = state.modals.filter((modal) => {
        if (instanceId) return modal.instanceId !== instanceId;
        if (modalType) return modal.modalType !== modalType;
        return true;
      });
      return modals.length === state.modals.length ? state : { ...state, modals };
    }
    case actions.CLOSE_ALL: {
      return {
        ...state,
        modals: []
      };
    }
    case actions.UPDATE_MODAL: {
      const { instanceId, changes } = action;
      let found = false;
      const modals = state.modals.map((modal) => {
        if (modal.instanceId !== instanceId) return modal;
        found = true;
        return {
          ...modal,
          props: { ...modal.props, ...(changes.props || {}) },
          modalProps: { ...modal.modalProps, ...(changes.modalProps || {}) },
          options: { ...modal.options, ...(changes.options || {}) },
        };
      });
      return found ? { ...state, modals } : state;
    }
    case actions.BRING_TO_FRONT: {
      const { instanceId } = action;
      const index = state.modals.findIndex((modal) => modal.instanceId === instanceId);
      if (index < 0 || index === state.modals.length - 1) return state;
      const modals = [...state.modals];
      const [modal] = modals.splice(index, 1);
      modals.push(modal);
      return { ...state, modals };
    }
    default: return state;
  }
}

export default reducer;