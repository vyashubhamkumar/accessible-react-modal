# accessible-react-modal

An accessible modal manager for React applications. It provides a modal registry, stack-aware instance management, and a styled default dialog shell backed by Radix Dialog.

## Requirements

- React and React DOM 18 or 19
- Node.js 18 or newer for development and package builds

## Installation

```sh
npm install accessible-react-modal react react-dom
```

Import the optional default-shell stylesheet once in your application entry point:

```js
import 'accessible-react-modal/styles.css';
```

The JavaScript package does not inject global CSS. The stylesheet only styles the library's `DefaultModal`; omit it when supplying a custom `Modal` shell.

## Quick Start

Register modal body components with the provider, then open them by their registration key:

```jsx
import { ModalContextProvider, useModal } from 'accessible-react-modal';
import 'accessible-react-modal/styles.css';

function ProfileDialog({ name, modalId }) {
	const { hideModal } = useModal();

	return (
		<>
			<h2>Edit {name}</h2>
			<button onClick={() => hideModal({ id: modalId })}>Done</button>
		</>
	);
}

const modalComponents = { profile: ProfileDialog };

function OpenProfileButton() {
	const { showModal } = useModal();

	return (
		<button
			onClick={() => showModal({
				type: 'profile',
				props: { name: 'Avery' },
				ariaLabel: 'Edit Avery profile',
			})}
		>
			Edit profile
		</button>
	);
}

export function App() {
	return (
		<ModalContextProvider modalComponents={modalComponents}>
			<OpenProfileButton />
		</ModalContextProvider>
	);
}
```

The provider uses the accessible `DefaultModal` shell unless a custom `Modal` component is supplied. Modal bodies receive their opening `props` and a reserved `modalId` string. Keep that ID if the body needs to close its own instance.

## API

### `ModalContextProvider`

| Prop | Description |
| --- | --- |
| `modalComponents` | Object mapping modal type strings to React components. |
| `defaultOptions` | Default shell and dismissal options applied to each opened modal. Per-instance options override these values. |
| `Modal` | Optional custom shell component. It receives `open`, `modalId`, `isTopmost`, `onClose(reason)`, the shell options, and modal body children. A custom shell is responsible for its own dialog accessibility, focus management, portals, and stack presentation. |
| `children` | Application content that uses `useModal`. |

### `useModal`

Returns `showModal`, `hideModal`, `hideAllModals`, `closeTopModal`, `updateModal`, and `bringToFront`. It must be used within a `ModalContextProvider`.

`showModal({ type, props, modalProps, ...options })` opens a registered modal and returns its unique instance ID. `props` are passed to the registered modal body. Shell options may be passed directly; `modalProps` is also supported for shell-specific props. For compatibility, `props.modalProps` is still recognized and merged with top-level `modalProps`.

Supported shell options:

| Option | Default | Description |
| --- | --- | --- |
| `ariaLabel` | `"Dialog"` | Accessible name fallback for the default dialog. Prefer a meaningful name. |
| `labelledBy` | unset | ID of an existing element that names the dialog. |
| `describedBy` | unset | ID of an existing element that describes the dialog. |
| `closeOnEscape` | `true` | Allow Escape to close the modal. |
| `closeOnBackdropClick` | `true` | Allow an outside pointer interaction to close the modal. |
| `dismissible` | `true` | Enable the close button and Escape/backdrop dismissal. |
| `initialFocusRef` | unset | Ref to focus when the dialog opens. Otherwise focus is managed by Radix Dialog. |
| `portalContainer` | `document.body` | DOM element used as the portal container. |
| `className` | `""` | Additional class for the default dialog panel. |
| `overlayClassName` | `""` | Additional class for the backdrop. |
| `closeButtonClassName` | `""` | Additional class for the default close button. |
| `onBeforeClose` | unset | Return `false` or resolve `false` to veto closing. A void/true result allows it. |
| `onClose` | unset | Called with `{ id, type, reason }` after the instance has been removed from React state. |
| `onCloseError` | unset | Called as `(error, event)` if `onBeforeClose` throws or rejects. The modal stays open. |
| `onAfterOpen` | unset | Called once per instance when it first becomes the active top dialog. |

Close reasons are `escape`, `backdrop`, `close-button`, and `programmatic`.

- `hideModal({ id })` closes one instance. `instanceId` is accepted as an alias for `id`.
- `hideModal({ type })` retains the previous API and requests close for every open instance of that type.
- `hideAllModals()` requests close for every open instance.
- `closeTopModal()` requests close for the active top instance.
- `updateModal({ id, props, modalProps, options })` shallow-merges each provided object into that instance. Omitted fields stay unchanged. Returns `false` if the ID is not open.
- `bringToFront({ id })` moves an open instance to the top of the stack and activates it. Returns `false` if the ID is not open.

`hideModal`, `hideAllModals`, and `closeTopModal` return promises resolving to a boolean (or a boolean array for multiple instances). A synchronous or missing `onBeforeClose` guard still dispatches the close immediately; an async guard keeps the modal open until it resolves. Concurrent close requests for one instance are ignored while its guard is pending. Guard rejection is reported through `onCloseError` when supplied and resolves to `false`; it does not close the modal. `onClose` is emitted after React commits the removal, not when the request begins. `onAfterOpen` fires once when that instance first becomes the active top dialog, including when it was initially underneath another instance.

Opening the same type more than once creates separate instances. The most recently opened instance is topmost and is the only active dialog; covered instances remain visually stacked but are inert and hidden from assistive technology. Closing the topmost instance returns focus to its opener or to the original opener when the entire stack closes.

## Accessibility and Styling

The default shell uses Radix Dialog for dialog semantics, focus containment, keyboard dismissal, portal handling, background scroll locking, and focus cleanup. It provides an accessible close button and supports a custom accessible name, initial focus ref, and configurable portal host. Reduced-motion preferences are respected by the included stylesheet.

Use meaningful `ariaLabel` text or point `labelledBy` to an appropriate visible heading. When implementing a custom shell, preserve the topmost-only interaction model using the `isTopmost` prop: covered shells should not remain focusable or exposed as active dialogs.

All default-shell class names start with `arm-`. The content panel, backdrop, and close button accept `className`, `overlayClassName`, and `closeButtonClassName`. CSS variables available for theme overrides are `--arm-overlay-background`, `--arm-overlay-z-index`, `--arm-content-background`, `--arm-content-color`, `--arm-content-border`, `--arm-content-radius`, `--arm-content-shadow`, `--arm-content-width`, `--arm-content-max-height`, `--arm-content-padding`, `--arm-content-z-index`, `--arm-close-color`, and `--arm-close-background`. For example:

```css
.my-dialog-theme {
	--arm-content-background: #f4f8df;
	--arm-content-color: #26331d;
	--arm-content-radius: 2px;
	--arm-content-width: min(42rem, calc(100vw - 2rem));
}
```

Apply `className: 'my-dialog-theme'` to a modal instance. The stylesheet is an opt-in package export at `accessible-react-modal/styles.css`; it does not style application content globally.

The local demo (`npm start`) includes information, async unsaved-form, stacked, non-dismissible, portal/theme, and custom-shell examples. It also displays the manager methods and generated usage snippets.

## Server Rendering

The package can be imported in server-rendered applications. Portal content is rendered on the client, so modal content should not be expected in the server HTML. Only open a modal in response to a client interaction or after hydration. Supply `portalContainer` only when its DOM element exists.

## Migration

- `showModal` now returns an instance ID; existing callers may ignore the return value.
- `hideModal({ type })` remains supported. If multiple instances of that type are open, it closes all of them; use `hideModal({ id })` to close just one.
- Supplying a custom `Modal` remains supported, but is no longer required. Custom shells now receive `modalId` and `isTopmost` in addition to `open`, `onClose`, and children.
- `onClose` callbacks receive a metadata object with a close reason.
- Invalid or unregistered modal types now throw a `TypeError` instead of logging and silently doing nothing.

## Development and Release

```sh
npm install
npm start
npm test -- --watchAll=false
npm run typecheck
npm run build
npm pack --dry-run
```

`npm run build` builds the npm library to `dist/` and then builds the CRA demo to `build/`. The published package includes only `dist/`, `types/`, this README, and the MIT license. Review the dry-run package contents and verify the npm package name is publishable before publishing. Publishing is intentionally not part of the build scripts.

## GitHub Pages Demo

The demo can be built for the shared Pages site at `https://vyashubhamkumar.github.io/lib/accessible-react-modal/`:

```sh
npm run build:pages
```

The output is written to `build/pages/lib/accessible-react-modal/`. Copy or deploy the contents of `build/pages/` into the root of the Pages site repository, preserving the `lib/accessible-react-modal/` directory. The generated HTML and asset URLs are already prefixed for that nested route.

To build another library for a sibling path, set `DOCS_BASE_PATH` and keep the same shared output layout:

```sh
DOCS_BASE_PATH=/lib/some-other-lib-later npm run build:pages
```

That build writes to `build/pages/lib/some-other-lib-later/`. Merge each library's `build/pages/` contents into the Pages site so the library directories coexist. The normal `npm run build` behavior is unchanged.