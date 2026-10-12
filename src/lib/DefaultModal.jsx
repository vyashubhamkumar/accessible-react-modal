import React from 'react';
import { createPortal } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import './styles.css';

function DefaultModal({
  open,
  onClose,
  children,
  modalId,
  ariaLabel = 'Dialog',
  labelledBy,
  describedBy,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  dismissible = true,
  initialFocusRef,
  portalContainer,
  className = '',
  overlayClassName = '',
  closeButtonClassName = '',
  isTopmost = true,
}) {
  if (!isTopmost) {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div className="arm-underlay" aria-hidden="true" inert="" data-modal-id={modalId}>
        <div className={`arm-overlay ${overlayClassName}`.trim()} />
        <div className={`arm-content ${className}`.trim()}>{children}</div>
      </div>,
      portalContainer || document.body
    );
  }

  const handleEscape = (event) => {
    event.preventDefault();
    if (dismissible && closeOnEscape) onClose?.('escape');
  };

  const handleOutsidePointer = (event) => {
    event.preventDefault();
    if (dismissible && closeOnBackdropClick) onClose?.('backdrop');
  };

  return (
    <Dialog.Root
      open={open}
      modal
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose?.('programmatic');
      }}
    >
      <Dialog.Portal container={portalContainer || undefined}>
        <Dialog.Overlay className={`arm-overlay ${overlayClassName}`.trim()} />
        <Dialog.Content
          className={`arm-content ${className}`.trim()}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          data-modal-id={modalId}
          onEscapeKeyDown={handleEscape}
          onPointerDownOutside={handleOutsidePointer}
          onOpenAutoFocus={(event) => {
            if (initialFocusRef?.current) {
              event.preventDefault();
              initialFocusRef.current.focus();
            }
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Dialog.Title className="arm-visually-hidden">{ariaLabel}</Dialog.Title>
          {dismissible && (
            <button
              type="button"
              className={`arm-close ${closeButtonClassName}`.trim()}
              aria-label="Close dialog"
              onClick={() => onClose?.('close-button')}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DefaultModal;