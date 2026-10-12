import React, { useState } from 'react';
import { DefaultModal, ModalContextProvider, useModal } from '../lib';

export const DemoTypes = {
  INFO: 'information',
  FORM: 'unsaved-form',
  STACK: 'stack-parent',
  STACK_CHILD: 'stack-child',
  LOCKED: 'non-dismissible',
  CUSTOM: 'custom-shell',
};

export const DemoModalComponents = {
  [DemoTypes.INFO]: InformationDialog,
  [DemoTypes.FORM]: UnsavedFormDialog,
  [DemoTypes.STACK]: StackParentDialog,
  [DemoTypes.STACK_CHILD]: StackChildDialog,
  [DemoTypes.LOCKED]: LockedDialog,
  [DemoTypes.CUSTOM]: InformationDialog,
};

function InformationDialog({ modalId, themeName }) {
  const { hideModal, updateModal } = useModal();
  const updateTheme = () => updateModal({ id: modalId, props: { themeName: `${themeName} updated` } });
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">DEFAULT SHELL</p>
      <h2>Information, clearly presented.</h2>
      <p>The default dialog handles focus, keyboard dismissal, background scroll locking, and returning focus to the opener.</p>
      <dl className="dialog-details">
        <div><dt>Instance</dt><dd>{modalId}</dd></div>
        <div><dt>Theme</dt><dd>{themeName || 'Default'}</dd></div>
      </dl>
      {themeName && <button className="button button-quiet" onClick={updateTheme}>Update this modal</button>}
      <button className="button button-primary" onClick={() => hideModal({ id: modalId })}>Got it</button>
    </div>
  );
}

function UnsavedFormDialog({ modalId, dirtyState }) {
  const { hideModal } = useModal();
  const [value, setValue] = useState('Project notes');
  const [saved, setSaved] = useState(false);
  const save = () => {
    dirtyState.current = false;
    setSaved(true);
  };
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">ASYNC CLOSE GUARD</p>
      <h2>Unsaved changes</h2>
      <p>Try closing this dialog before saving. The guard asks for confirmation before discarding your edit.</p>
      <label className="field-label" htmlFor="demo-note">Document title</label>
      <input
        id="demo-note"
        className="demo-input"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          dirtyState.current = true;
          setSaved(false);
        }}
      />
      <div className="dialog-actions">
        <span className={saved ? 'save-state is-saved' : 'save-state'}>{saved ? 'Saved' : 'Unsaved'}</span>
        <button className="button button-primary" onClick={save}>Save changes</button>
        <button className="button button-quiet" onClick={() => hideModal({ id: modalId })}>Close</button>
      </div>
    </div>
  );
}

function StackParentDialog({ modalId }) {
  const { showModal, bringToFront, hideAllModals } = useModal();
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">STACK MANAGEMENT</p>
      <h2>First layer</h2>
      <p>Open another dialog, then bring this instance back to the top without removing either one.</p>
      <div className="dialog-actions">
        <button className="button button-primary" onClick={() => showModal({ type: DemoTypes.STACK_CHILD, ariaLabel: 'Second stack layer', props: { parentId: modalId } })}>Open second layer</button>
        <button className="button button-quiet" onClick={() => bringToFront({ id: modalId })}>Bring this layer forward</button>
        <button className="button button-quiet" onClick={hideAllModals}>Close all layers</button>
      </div>
    </div>
  );
}

function StackChildDialog({ parentId }) {
  const { closeTopModal, bringToFront } = useModal();
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">TOPMOST INSTANCE</p>
      <h2>Second layer</h2>
      <p>Only this top layer handles Escape. You can also explicitly return the parent to the front.</p>
      <div className="dialog-actions">
        <button className="button button-primary" onClick={closeTopModal}>Close top layer</button>
        <button className="button button-quiet" onClick={() => bringToFront({ id: parentId })}>Bring first layer forward</button>
      </div>
    </div>
  );
}

function LockedDialog({ modalId }) {
  const { hideModal } = useModal();
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">DISMISSAL CONTROL</p>
      <h2>This dialog stays put.</h2>
      <p>Escape, backdrop clicks, and the default close control are disabled. The explicit action remains available.</p>
      <button className="button button-primary" onClick={() => hideModal({ id: modalId })}>Continue</button>
    </div>
  );
}

function CustomShell({ children, className = '', overlayClassName = '', ...props }) {
  return (
    <DefaultModal
      {...props}
      className={`arm-demo-custom-shell ${className}`.trim()}
      overlayClassName={`arm-demo-custom-overlay ${overlayClassName}`.trim()}
    >
      {children}
    </DefaultModal>
  );
}

function CustomShellBody() {
  return (
    <div className="demo-dialog-body">
      <p className="dialog-kicker">CUSTOM PROVIDER SHELL</p>
      <h2>Same behavior, different finish.</h2>
      <p>This nested provider supplies its own shell component while reusing the accessible default primitives.</p>
    </div>
  );
}

function CustomShellContent({ theme }) {
  const { showModal } = useModal();
  return (
    <button
      className="button button-primary"
      onClick={() => showModal({
        type: 'custom',
        ariaLabel: `${theme.name} custom shell example`,
        className: theme.contentClass,
        overlayClassName: theme.overlayClass,
      })}
    >
      Open custom shell
    </button>
  );
}

export function CustomShellExample({ theme }) {
  return (
    <ModalContextProvider modalComponents={{ custom: CustomShellBody }} Modal={CustomShell}>
      <CustomShellContent theme={theme} />
    </ModalContextProvider>
  );
}
