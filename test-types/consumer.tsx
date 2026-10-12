import { ModalContextProvider, useModal } from '../types';

function SettingsModal({ section }: { section: string }) {
  return <p>{section}</p>;
}

const modalComponents = { settings: SettingsModal };

function Consumer() {
  const { showModal, hideModal, hideAllModals, closeTopModal, updateModal, bringToFront } = useModal();
  return (
    <button onClick={() => {
      const id = showModal({ type: 'settings', props: { section: 'profile' }, ariaLabel: 'Settings' });
      hideModal({ id });
      hideAllModals();
      closeTopModal();
      updateModal({ id, props: { section: 'security' } });
      bringToFront({ id });
    }}>
      Open settings
    </button>
  );
}

export const example = (
  <ModalContextProvider modalComponents={modalComponents} defaultOptions={{ closeOnEscape: false }}>
    <Consumer />
  </ModalContextProvider>
);
