import React, { useState } from 'react';

const installSnippet = `npm install accessible-react-modal react react-dom`;

const setupSnippet = `import { ModalContextProvider, useModal } from 'accessible-react-modal';
import 'accessible-react-modal/styles.css';

function AccountDialog({ user, modalId }) {
  const { hideModal } = useModal();

  return (
    <section>
      <h2>Account for {user.name}</h2>
      <button onClick={() => hideModal({ id: modalId })}>
        Done
      </button>
    </section>
  );
}

const modalComponents = { account: AccountDialog };

export function App() {
  return (
    <ModalContextProvider modalComponents={modalComponents}>
      <AccountButton />
    </ModalContextProvider>
  );
}

function AccountButton() {
  const { showModal } = useModal();

  return (
    <button
      onClick={() => showModal({
        type: 'account',
        props: { user: { name: 'Avery' } },
        ariaLabel: 'Avery account details',
      })}
    >
      View account
    </button>
  );
}`;

const customShellSnippet = `import { DefaultModal, ModalContextProvider } from 'accessible-react-modal';

function BrandedModal(props) {
  return (
    <DefaultModal
      {...props}
      className="brand-dialog"
      overlayClassName="brand-backdrop"
    />
  );
}

<ModalContextProvider
  modalComponents={modalComponents}
  Modal={BrandedModal}
>
  <App />
</ModalContextProvider>`;

const apiMethods = [
  {
    name: 'showModal',
    signature: 'showModal(options) => id',
    description: 'Open a registered modal type. Each call creates a distinct stack instance and returns its stable ID. The body receives options.props and the reserved modalId prop.',
    snippet: `const id = showModal({
  type: 'account',
  props: { userId: 'u_42' },
  ariaLabel: 'Account details',
});`,
    returns: 'The unique instance ID as a string.',
  },
  {
    name: 'hideModal',
    signature: 'hideModal({ id?, instanceId?, type?, reason? }) => Promise<boolean | boolean[]>',
    description: 'Request closure by instance ID, or close every currently open instance of a type. An onBeforeClose guard can veto the request.',
    snippet: `// Close exactly one instance.
await hideModal({ id: accountModalId });

// Legacy behavior: close all open instances of this type.
await hideModal({ type: 'account' });`,
    returns: 'A promise for one close result, or an array of results when matching multiple instances.',
  },
  {
    name: 'hideAllModals',
    signature: 'hideAllModals() => Promise<boolean[]>',
    description: 'Request closure of every open instance. Each instance runs its own before-close guard; one veto does not block the others.',
    snippet: `const results = await hideAllModals();
const allClosed = results.every(Boolean);`,
    returns: 'A promise resolving to one boolean result per open instance.',
  },
  {
    name: 'closeTopModal',
    signature: 'closeTopModal() => Promise<boolean>',
    description: 'Request closure of the active topmost instance without needing to retain its ID. It respects the same guard and close-reason behavior as other close methods.',
    snippet: `const closed = await closeTopModal();`,
    returns: 'A promise resolving to true when the top instance closes, otherwise false.',
  },
  {
    name: 'updateModal',
    signature: 'updateModal({ id, props?, modalProps?, options? }) => boolean',
    description: 'Shallow-merge body props, shell props, or options into one open instance. Omitted values remain unchanged. Nested objects are not deep-merged.',
    snippet: `const updated = updateModal({
  id: accountModalId,
  props: { userId: 'u_43' },
  options: { ariaLabel: 'Updated account details' },
});`,
    returns: 'true if the ID is open and an update was dispatched; otherwise false.',
  },
  {
    name: 'bringToFront',
    signature: 'bringToFront({ id }) => boolean',
    description: 'Move an existing instance to the top of the modal stack. It becomes the active accessible dialog and receives keyboard dismissal.',
    snippet: `const moved = bringToFront({ id: accountModalId });`,
    returns: 'true if the ID is open; otherwise false.',
  },
];

function CodeBlock({ code, label = 'Copy code' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="docs-code-block">
      <div className="docs-code-toolbar">
        <span>JSX / JAVASCRIPT</span>
        <button onClick={copy} aria-label={label}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, index }) {
  return (
    <header className="page-heading docs-page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="intro-copy">{description}</p>
      </div>
      {index && <span className="heading-index">{index}</span>}
    </header>
  );
}

export function OverviewPage({ onNavigate }) {
  return (
    <div className="docs-page">
      <PageHeading
        eyebrow="ACCESSIBLE REACT MODAL / DOCUMENTATION"
        title="A modal system that stays out of your way."
        description="Stack-aware modal management with an accessible default dialog, lifecycle controls, and room for your own design system."
        index="OVERVIEW"
      />
      <section className="overview-lede">
        <div className="overview-mark" aria-hidden="true"><span>01</span><i /><i /><i /></div>
        <div>
          <p className="section-label">SMALL API. COMPLETE CONTROL.</p>
          <p className="overview-statement">Register dialog content once, open it anywhere, and keep dismissal, focus, and stacked layers predictable.</p>
          <button className="button button-primary" onClick={() => onNavigate('playground')}>Explore the playground <span aria-hidden="true">→</span></button>
        </div>
      </section>
      <section className="overview-feature-grid" aria-label="Library capabilities">
        <article className="overview-feature"><span className="feature-index">A</span><h2>Accessible by default</h2><p>Dialog semantics, focus containment and restoration, Escape handling, portals, and scroll locking are provided by the default shell.</p></article>
        <article className="overview-feature"><span className="feature-index">B</span><h2>Stack-aware instances</h2><p>Open the same registered type more than once. Only the top instance is active; close or reorder instances by their IDs.</p></article>
        <article className="overview-feature"><span className="feature-index">C</span><h2>Veto before closing</h2><p>Use sync or async guards for unsaved work, then observe committed close events with reasons.</p></article>
        <article className="overview-feature"><span className="feature-index">D</span><h2>Bring your own look</h2><p>Theme the default shell with CSS variables and classes, or replace its shell with your own accessible component.</p></article>
      </section>
      <section className="docs-next-steps">
        <div><p className="section-label">START HERE</p><h2>Install it, register a dialog, then open it.</h2></div>
        <div className="next-step-actions">
          <button className="button button-quiet" onClick={() => onNavigate('installation')}>Installation <span aria-hidden="true">→</span></button>
          <button className="button button-quiet" onClick={() => onNavigate('setup')}>Library setup <span aria-hidden="true">→</span></button>
          <button className="button button-quiet" onClick={() => onNavigate('api')}>API reference <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </div>
  );
}

export function InstallationPage() {
  return (
    <div className="docs-page">
      <PageHeading eyebrow="GETTING STARTED / 01" title="Installation" description="Install the published package and its React peers, then opt into the default-shell styles." index="INSTALL" />
      <section className="docs-section">
        <p className="section-label">AFTER NPM PUBLISH</p>
        <h2>Install from the registry</h2>
        <p>Once a release is published, install the library alongside React and React DOM. The library supports React 18 and 19.</p>
        <CodeBlock code={installSnippet} />
        <p className="docs-muted">The package declares React and React DOM as peer dependencies. Your application should provide them; they are not bundled into the library.</p>
      </section>
      <section className="docs-section docs-section-bordered">
        <p className="section-label">DEFAULT SHELL STYLES</p>
        <h2>Styles are opt-in</h2>
        <p>Import the stylesheet once in your application entry point to style the built-in dialog. If you provide a fully custom shell, you can omit it.</p>
        <CodeBlock code="import 'accessible-react-modal/styles.css';" />
      </section>
      <section className="release-note"><strong>Before the first release</strong><p>The package name has not been confirmed as currently publishable. After the package owner publishes the first version, use the install command above. Until then, use a local workspace or Git dependency for development; registry installation will not work before publication.</p></section>
    </div>
  );
}

export function SetupPage() {
  return (
    <div className="docs-page">
      <PageHeading eyebrow="GETTING STARTED / 02" title="Library setup" description="Register modal body components once, then control them from anywhere beneath the provider." index="SETUP" />
      <section className="docs-section">
        <p className="section-label">PROVIDER + REGISTRY</p>
        <h2>One provider at the application boundary</h2>
        <p>Map stable string keys to React components. The provider supplies the default accessible shell, while modal bodies can use the same hook to close or open other instances.</p>
        <CodeBlock code={setupSnippet} />
      </section>
      <section className="docs-section docs-section-bordered">
        <p className="section-label">CUSTOM SHELL</p>
        <h2>Keep the behavior, change the frame</h2>
        <p>Pass a shell component through <code>Modal</code>. The default shell can itself be wrapped and themed; a fully custom shell must provide dialog semantics, focus management, portal behavior, and correct topmost handling.</p>
        <CodeBlock code={customShellSnippet} />
      </section>
      <section className="setup-notes">
        <div><span>01</span><p>Every <code>showModal</code> call creates a distinct instance and returns its ID.</p></div>
        <div><span>02</span><p>Modal body props come from <code>showModal({`{ props }`})</code>; <code>modalId</code> is reserved and always supplied by the provider.</p></div>
        <div><span>03</span><p>Import package CSS only when using the default shell or a shell that relies on its class tokens.</p></div>
      </section>
    </div>
  );
}

export function ApiPage() {
  return (
    <div className="docs-page api-docs-page">
      <PageHeading eyebrow="REFERENCE / API" title="Modal manager API" description="Methods, close lifecycle, and configuration options exposed by useModal and ModalContextProvider." index="API / 01—06" />
      <nav className="api-toc" aria-label="API methods">
        {apiMethods.map((method) => <a key={method.name} href={`#method-${method.name}`}>{method.name}</a>)}
        <a href="#lifecycle">lifecycle</a>
        <a href="#provider-options">options</a>
      </nav>
      <div className="api-method-list">
        {apiMethods.map((method, index) => (
          <section className="api-method" id={`method-${method.name}`} key={method.name}>
            <div className="api-method-title">
              <span className="api-method-index">0{index + 1}</span>
              <div><h2>{method.name}</h2><code>{method.signature}</code></div>
            </div>
            <div className="api-method-detail">
              <p>{method.description}</p>
              <p className="api-return"><strong>Returns</strong> {method.returns}</p>
              <CodeBlock code={method.snippet} />
            </div>
          </section>
        ))}
      </div>
      <section className="docs-section docs-section-bordered" id="lifecycle">
        <p className="section-label">LIFECYCLE</p>
        <h2>Close requests are guarded consistently</h2>
        <p><code>onBeforeClose(event)</code> runs for Escape, backdrop, close-button, and programmatic requests. Return <code>false</code> or resolve to <code>false</code> to keep the instance open. A thrown or rejected guard also keeps it open and invokes <code>onCloseError(error, event)</code>.</p>
        <p><code>onClose(event)</code> runs once after the instance is removed from React state. <code>onAfterOpen(event)</code> runs once when the instance first becomes the active top dialog. Each event contains the instance <code>id</code> and registered <code>type</code>; close events also include a <code>reason</code>.</p>
        <CodeBlock code={`showModal({
  type: 'editor',
  onBeforeClose: async ({ reason }) => {
    if (!hasUnsavedChanges) return true;
    return reason === 'programmatic' || confirm('Discard changes?');
  },
  onClose: ({ id, reason }) => analytics.track('modal_closed', { id, reason }),
  onCloseError: (error) => reportError(error),
  onAfterOpen: ({ id }) => focusEditor(id),
});`} />
      </section>
      <section className="docs-section docs-section-bordered" id="provider-options">
        <p className="section-label">OPTIONS</p>
        <h2>Per-instance options override provider defaults</h2>
        <p>Shell options include <code>ariaLabel</code>, <code>labelledBy</code>, <code>describedBy</code>, <code>closeOnEscape</code>, <code>closeOnBackdropClick</code>, <code>dismissible</code>, <code>initialFocusRef</code>, <code>portalContainer</code>, <code>className</code>, <code>overlayClassName</code>, and <code>closeButtonClassName</code>. Set defaults on <code>ModalContextProvider</code>, or override them in <code>showModal</code>.</p>
        <CodeBlock code={`<ModalContextProvider
  modalComponents={modalComponents}
  defaultOptions={{ closeOnEscape: true, closeOnBackdropClick: false }}
>
  <App />
</ModalContextProvider>`} />
      </section>
    </div>
  );
}
