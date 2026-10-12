import React, { useRef } from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import { ModalContextProvider, useModal } from './lib';

function ExampleModal({ label }) {
  const { showModal } = useModal();
  return (
    <div>
      {label}
      {label === 'First' && (
        <button onClick={() => showModal({ type: 'example', props: { label: 'Second' } })}>
          Open nested
        </button>
      )}
    </div>
  );
}

function FocusModal({ inputRef }) {
  return (
    <>
      <input ref={inputRef} aria-label="Focus target" />
      <button>Last focusable</button>
    </>
  );
}

function FocusControls() {
  const { showModal } = useModal();
  const inputRef = useRef(null);
  return (
    <button onClick={() => showModal({
      type: 'focus',
      props: { inputRef },
      initialFocusRef: inputRef,
      ariaLabel: 'Focus example',
    })}>
      Open focus dialog
    </button>
  );
}

function TestControls({ options = {} }) {
  const { showModal, hideModal } = useModal();
  return (
    <>
      <button onClick={() => showModal({ type: 'example', props: { label: 'First' }, ...options })}>
        Open first
      </button>
      <button onClick={() => showModal({ type: 'example', props: { label: 'Second' } })}>
        Open second
      </button>
      <button onClick={() => hideModal({ type: 'example' })}>Close by type</button>
    </>
  );
}

function TestModal({ children, onClose }) {
  return (
    <section>
      {children}
      <button onClick={() => onClose('close-button')}>Close instance</button>
    </section>
  );
}

test('allows multiple instances of a modal type and closes only the selected instance', () => {
  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }} Modal={TestModal}>
      <TestControls />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open first'));
  fireEvent.click(screen.getByText('Open nested'));

  expect(screen.getByText('First')).toBeInTheDocument();
  expect(screen.getByText('Second')).toBeInTheDocument();
  expect(screen.getAllByText('Close instance')).toHaveLength(2);

  fireEvent.click(screen.getAllByText('Close instance')[0]);

  expect(screen.queryByText('First')).not.toBeInTheDocument();
  expect(screen.getByText('Second')).toBeInTheDocument();
});

test('retains legacy close-by-type behavior', () => {
  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }} Modal={TestModal}>
      <TestControls />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open first'));
  fireEvent.click(screen.getByText('Open second'));
  fireEvent.click(screen.getByText('Close by type'));

  expect(screen.queryByText('First')).not.toBeInTheDocument();
  expect(screen.queryByText('Second')).not.toBeInTheDocument();
});

test('renders the accessible default dialog in a custom portal and restores focus on Escape', () => {
  const portalHost = document.createElement('div');
  document.body.appendChild(portalHost);
  render(
    <ModalContextProvider
      modalComponents={{ example: ExampleModal }}
      defaultOptions={{ ariaLabel: 'Example dialog', portalContainer: portalHost }}
    >
      <TestControls />
    </ModalContextProvider>
  );

  const trigger = screen.getByText('Open first');
  trigger.focus();
  fireEvent.click(trigger);

  const dialog = within(portalHost).getByRole('dialog', { name: 'Example dialog' });
  expect(dialog).toBeInTheDocument();
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  portalHost.remove();
});

test('supports backdrop dismissal and can disable Escape dismissal per instance', async () => {
  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      <TestControls options={{ closeOnEscape: false }} />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open first'));
  const dialog = screen.getByRole('dialog', { name: 'Dialog' });
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
  expect(dialog).toBeInTheDocument();

  await waitFor(() => expect(document.body.style.pointerEvents).toBe('none'));
  expect(document.body).toHaveAttribute('data-scroll-locked');
  await waitFor(() => {
    fireEvent.pointerDown(document.querySelector('.arm-overlay'), { button: 0 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  expect(document.body.style.pointerEvents).toBe('');
  expect(document.body).not.toHaveAttribute('data-scroll-locked');
});

test('moves focus to the configured initial focus ref', () => {
  render(
    <ModalContextProvider modalComponents={{ focus: FocusModal }}>
      <FocusControls />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open focus dialog'));

  expect(screen.getByLabelText('Focus target')).toHaveFocus();
});

test('releases scroll locking when the provider unmounts', () => {
  const { unmount } = render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      <TestControls />
    </ModalContextProvider>
  );
  const trigger = screen.getByText('Open first');
  trigger.focus();
  fireEvent.click(trigger);
  expect(document.body).toHaveAttribute('data-scroll-locked');

  unmount();

  expect(trigger).not.toBeInTheDocument();
  expect(document.body).not.toHaveAttribute('data-scroll-locked');
  expect(document.body.style.pointerEvents).toBe('');
});

test('Escape closes only the topmost modal instance', () => {
  const wrapper = ({ children }) => (
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      {children}
    </ModalContextProvider>
  );
  const { result } = renderHook(() => useModal(), { wrapper });

  act(() => {
    result.current.showModal({ type: 'example', props: { label: 'First' } });
    result.current.showModal({ type: 'example', props: { label: 'Second' } });
  });
  const dialog = screen.getByRole('dialog');
  expect(screen.getByText('First').closest('.arm-underlay')).toHaveAttribute('aria-hidden', 'true');
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByText('First')).toBeInTheDocument();
  expect(screen.queryByText('Second')).not.toBeInTheDocument();
});

test('reports a close reason and rejects unregistered modal types', async () => {
  const onClose = jest.fn();
  const wrapper = ({ children }) => (
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      {children}
    </ModalContextProvider>
  );
  const { result } = renderHook(() => useModal(), { wrapper });

  expect(() => result.current.showModal({ type: 'missing' })).toThrow(TypeError);

  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      <TestControls options={{ onClose }} />
    </ModalContextProvider>
  );
  fireEvent.click(screen.getByText('Open first'));
  fireEvent.click(screen.getByLabelText('Close dialog'));

  await waitFor(() => expect(onClose).toHaveBeenCalledWith({
    id: expect.any(String),
    type: 'example',
    reason: 'close-button',
  }));
});

test('allows an asynchronous before-close guard to veto, then close after approval', async () => {
  const onBeforeClose = jest.fn()
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(true);
  const onClose = jest.fn();
  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      <TestControls options={{ onBeforeClose, onClose }} />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open first'));
  fireEvent.click(screen.getByLabelText('Close dialog'));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(screen.getByLabelText('Close dialog'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(onClose).toHaveBeenCalledWith({
    id: expect.any(String),
    type: 'example',
    reason: 'close-button',
  });
});

test('keeps a modal open and reports an error when a before-close guard rejects', async () => {
  const onCloseError = jest.fn();
  const onClose = jest.fn();
  render(
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      <TestControls options={{
        onBeforeClose: () => Promise.reject(new Error('guard failed')),
        onCloseError,
        onClose,
      }} />
    </ModalContextProvider>
  );

  fireEvent.click(screen.getByText('Open first'));
  fireEvent.click(screen.getByLabelText('Close dialog'));

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  await waitFor(() => expect(onCloseError).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'guard failed' }),
    expect.objectContaining({ type: 'example', reason: 'close-button' })
  ));
  expect(onClose).not.toHaveBeenCalled();
});

test('calls onAfterOpen once when an instance first becomes topmost', () => {
  const onAfterOpen = jest.fn();
  const wrapper = ({ children }) => (
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      {children}
    </ModalContextProvider>
  );
  const { result } = renderHook(() => useModal(), { wrapper });

  let firstId;
  act(() => {
    firstId = result.current.showModal({ type: 'example', props: { label: 'First' }, onAfterOpen });
  });
  expect(onAfterOpen).toHaveBeenCalledTimes(1);

  act(() => {
    result.current.bringToFront({ id: firstId });
  });
  expect(onAfterOpen).toHaveBeenCalledTimes(1);
});

test('updates one instance, brings it forward, and closes the active top modal', () => {
  const wrapper = ({ children }) => (
    <ModalContextProvider modalComponents={{ example: ExampleModal }}>
      {children}
    </ModalContextProvider>
  );
  const { result } = renderHook(() => useModal(), { wrapper });
  let firstId;
  let secondId;
  act(() => {
    firstId = result.current.showModal({ type: 'example', props: { label: 'First' } });
    secondId = result.current.showModal({ type: 'example', props: { label: 'Second' } });
  });

  act(() => {
    expect(result.current.updateModal({ id: firstId, props: { label: 'Updated first' } })).toBe(true);
    expect(result.current.bringToFront({ id: firstId })).toBe(true);
  });

  expect(screen.getByRole('dialog')).toHaveAttribute('data-modal-id', firstId);
  expect(screen.getByText('Updated first')).toBeInTheDocument();
  expect(screen.getByText('Second').closest('.arm-underlay')).toHaveAttribute('aria-hidden', 'true');

  act(() => {
    result.current.closeTopModal();
  });
  expect(screen.queryByText('Updated first')).not.toBeInTheDocument();
  expect(screen.getByText('Second')).toBeInTheDocument();
  expect(result.current.updateModal({ id: 'missing', props: {} })).toBe(false);
  act(() => {
    expect(result.current.bringToFront({ id: secondId })).toBe(true);
  });
});
