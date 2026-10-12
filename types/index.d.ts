import type { ComponentType, ReactElement, ReactNode, RefObject } from 'react';

export type ModalCloseReason = 'escape' | 'backdrop' | 'close-button' | 'programmatic';

export interface ModalCloseEvent {
  id: string;
  type: string;
  reason: ModalCloseReason;
}

export interface ModalOpenEvent {
  id: string;
  type: string;
}

export interface ModalOptions {
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  dismissible?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  portalContainer?: HTMLElement | null;
  className?: string;
  overlayClassName?: string;
  closeButtonClassName?: string;
  onBeforeClose?: (event: ModalCloseEvent) => boolean | void | Promise<boolean | void>;
  onClose?: (event: ModalCloseEvent) => void;
  onCloseError?: (error: unknown, event: ModalCloseEvent) => void;
  onAfterOpen?: (event: ModalOpenEvent) => void;
}

export interface DefaultModalProps extends Omit<ModalOptions, 'onClose'> {
  open: boolean;
  modalId: string;
  isTopmost?: boolean;
  overlayClassName?: string;
  closeButtonClassName?: string;
  onClose: (reason?: ModalCloseReason) => void;
  children?: ReactNode;
}

export interface ShowModalOptions<TProps extends Record<string, unknown> = Record<string, unknown>> extends ModalOptions {
  type: string;
  props?: TProps & { modalProps?: Partial<DefaultModalProps> };
  modalProps?: Partial<DefaultModalProps>;
}

export interface ModalManager {
  showModal<TProps extends Record<string, unknown> = Record<string, unknown>>(options: ShowModalOptions<TProps>): string;
  hideModal(options?: { id?: string; instanceId?: string; type?: string; reason?: ModalCloseReason }): Promise<boolean | boolean[]>;
  hideAllModals(): Promise<boolean[]>;
  closeTopModal(): Promise<boolean>;
  updateModal(options: { id: string; props?: Record<string, unknown>; modalProps?: Partial<DefaultModalProps>; options?: ModalOptions }): boolean;
  bringToFront(options: { id: string }): boolean;
}

export interface ModalContextProviderProps {
  children?: ReactNode;
  modalComponents?: Record<string, ComponentType<any>>;
  Modal?: ComponentType<DefaultModalProps>;
  defaultOptions?: ModalOptions;
}

export function ModalContextProvider(props: ModalContextProviderProps): ReactElement | null;
export function useModal(): ModalManager;
export const DefaultModal: ComponentType<DefaultModalProps>;
