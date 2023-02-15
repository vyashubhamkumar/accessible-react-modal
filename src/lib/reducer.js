export const initialState = {
  modals: [],
};

const actions = {
  OPEN_MODAL: 'open_modal',
  CLOSE_MODAL: 'close_modal',
  CLOSE_ALL: 'close_all',
}


export const openModal = (modalType, passedState) => ({
  type: actions.OPEN_MODAL,
  modalType,
  ...passedState
});

export const closeModal = (modalType) => ({
  type: actions.CLOSE_MODAL,
  modalType
});

export const closeAllModals = () => ({
  type: actions.CLOSE_ALL,
});

function reducer(state, action) {
  switch(action.type) {
    case actions.OPEN_MODAL: {
      console.log({state, action})
      const { modalType, props } = action;
      const prevModals = [...state.modals].filter(o => o.modalType !== modalType)
      if(modalType) {
        return {
          ...state,
          modals: [...prevModals, {
            open: true,
            modalType,
            props: {
              ...(props && (typeof props === 'object') ? props : {})
            },
          }],
        }
      }
      return state;
    }
    case actions.CLOSE_MODAL: {
      const { modalType } = action;
      if(modalType) {
        const modals = [...state.modals].filter(o => o.modalType !== modalType)
        return {
          ...state,
          modals,
        }
      }
      return state;
    }
    case actions.CLOSE_ALL: {
      return {
        ...state,
        modals: []
      };
    }
    default: return state;
  }
}

export default reducer;