import React, { useRef, useState } from 'react';
import './App.css';
import { useModal } from './lib';
import { CustomShellExample, DemoTypes } from './components/DemoModals';
import { ApiPage, InstallationPage, OverviewPage, SetupPage } from './components/DocumentationPages';

const examples = [
  { id: 'information', number: '01', title: 'Information dialog', summary: 'Accessible default shell and focus return.', type: DemoTypes.INFO },
  { id: 'unsaved', number: '02', title: 'Unsaved changes', summary: 'Async before-close guard for form edits.', type: DemoTypes.FORM },
  { id: 'stack', number: '03', title: 'Stacked dialogs', summary: 'Manage same-page layers and topmost focus.', type: DemoTypes.STACK },
  { id: 'locked', number: '04', title: 'Non-dismissible', summary: 'Disable Escape and backdrop dismissal.', type: DemoTypes.LOCKED },
  { id: 'portal', number: '05', title: 'Portal and theme', summary: 'Choose a portal host and visual theme.', type: DemoTypes.INFO },
  { id: 'custom', number: '06', title: 'Custom shell', summary: 'Replace the provider shell component.', type: DemoTypes.CUSTOM },
];

const themes = [
  { id: 'default', label: 'Chalk', contentClass: '', overlayClass: '', name: 'Chalk' },
  { id: 'citrus', label: 'Citrus', contentClass: 'arm-theme-citrus', overlayClass: 'arm-overlay-citrus', name: 'Citrus' },
  { id: 'coral', label: 'Coral', contentClass: 'arm-theme-coral', overlayClass: 'arm-overlay-coral', name: 'Coral' },
];

function App() {
  const { showModal } = useModal();
  const [pageId, setPageId] = useState('overview');
  const [selectedId, setSelectedId] = useState('information');
  const [themeId, setThemeId] = useState('default');
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activity, setActivity] = useState('Ready to preview');
  const portalTarget = useRef(null);
  const dirtyState = useRef(true);
  const selected = examples.find((example) => example.id === selectedId);
  const theme = themes.find((item) => item.id === themeId);

  const openSelected = () => {
    if (selected.id === 'custom') return;
    const onClose = ({ reason }) => setActivity(`Closed via ${reason.replace('-', ' ')}`);
    const onAfterOpen = () => setActivity(`Opened ${selected.title.toLowerCase()}`);
    const shellOptions = {
      closeOnEscape: selected.id === 'locked' ? false : closeOnEscape,
      closeOnBackdropClick: selected.id === 'locked' ? false : closeOnBackdropClick,
      dismissible: selected.id !== 'locked',
      onClose,
      onAfterOpen,
    };

    if (selected.id === 'unsaved') {
      dirtyState.current = true;
      shellOptions.onBeforeClose = async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 160));
        if (!dirtyState.current) return true;
        return window.confirm('Discard your unsaved changes?');
      };
    }

    shellOptions.className = theme.contentClass;
    shellOptions.overlayClassName = theme.overlayClass;
    if (selected.id === 'portal') shellOptions.portalContainer = portalTarget.current;

    showModal({
      type: selected.type,
      ariaLabel: theme.id === 'default' ? selected.title : `${theme.name} ${selected.title}`,
      props: {
        ...(selected.id === 'unsaved' ? { dirtyState } : {}),
        ...(selected.id === 'portal' ? { themeName: theme.name } : {}),
      },
      ...shellOptions,
    });
  };

  const snippet = selected.id === 'unsaved'
    ? "showModal({ type: 'unsaved-form', onBeforeClose: async () => confirmDiscard(), onClose: handleClosed })"
    : selected.id === 'stack'
      ? "const id = showModal({ type: 'stack-parent' })\nbringToFront({ id })\ncloseTopModal()"
      : selected.id === 'locked'
        ? "showModal({ type: 'non-dismissible', dismissible: false, closeOnEscape: false })"
        : selected.id === 'portal'
          ? "showModal({ type: 'information', portalContainer, className: 'my-dialog-theme' })"
          : selected.id === 'custom'
              ? `<ModalContextProvider modalComponents={dialogs} Modal={MyAccessibleShell}>
    <App />
  </ModalContextProvider>`
            : "showModal({ type: 'information', ariaLabel: 'Project information' })";

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="docs-app">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Accessible React Modal home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>accessible<span className="brand-light">/modal</span></span>
        </a>
        <div className="topbar-meta">
          <span className="version-tag">v0.1.0</span>
          <a href="https://github.com/vyashubhamkumar/accessible-react-modal" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <div className="docs-shell" id="top">
        <aside className="sidebar" aria-label="Demo navigation">
          <nav className="docs-nav">
            <p className="sidebar-label">DOCUMENTATION</p>
            {[
              { id: 'overview', label: 'Overview', number: '00' },
              { id: 'installation', label: 'Installation', number: '01' },
              { id: 'setup', label: 'Library setup', number: '02' },
              { id: 'api', label: 'API reference', number: '03' },
            ].map((item) => (
              <button
                key={item.id}
                className={`mode-link ${pageId === item.id ? 'is-active' : ''}`}
                onClick={() => setPageId(item.id)}
                aria-current={pageId === item.id ? 'page' : undefined}
              >
                <span className="mode-number">{item.number}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <p className="sidebar-label sidebar-playground-label">PLAYGROUND</p>
            {examples.map((example) => (
              <button
                key={example.id}
                className={`mode-link playground-example-link ${pageId === 'playground' && selectedId === example.id ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedId(example.id);
                  setPageId('playground');
                }}
                aria-current={pageId === 'playground' && selectedId === example.id ? 'page' : undefined}
              >
                <span className="mode-number">{example.number}</span>
                <span>{example.title}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <span className="status-dot" />
            <span>React 18 / 19</span>
          </div>
        </aside>

        <main className="main-content">
          {pageId === 'overview' && <OverviewPage onNavigate={setPageId} />}
          {pageId === 'installation' && <InstallationPage />}
          {pageId === 'setup' && <SetupPage />}
          {pageId === 'api' && <ApiPage />}
          {pageId === 'playground' && <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">ACCESSIBLE REACT MODAL</p>
              <h1>Modal playground</h1>
              <p className="intro-copy">Explore modal behavior, lifecycle hooks, and presentation options in a working demo.</p>
            </div>
            <span className="heading-index">API / 01—06</span>
          </div>

          <section className="example-heading" aria-live="polite">
            <div className="example-number">{selected.number}</div>
            <div>
              <h2>{selected.title}</h2>
              <p>{selected.summary}</p>
            </div>
            <span className="activity-pill"><span className="status-dot" />{activity}</span>
          </section>

          <section className="playground-grid" aria-label={`${selected.title} controls`}>
            <div className="control-column">
              <div className="control-section">
                <p className="section-label">BEHAVIOR</p>
                <label className="toggle-row">
                  <span><strong>Close on Escape</strong><small>Keyboard dismissal</small></span>
                  <input type="checkbox" checked={closeOnEscape} onChange={(event) => setCloseOnEscape(event.target.checked)} disabled={selected.id === 'locked'} />
                  <span className="toggle-track" aria-hidden="true" />
                </label>
                <label className="toggle-row">
                  <span><strong>Close on backdrop</strong><small>Outside pointer interaction</small></span>
                  <input type="checkbox" checked={closeOnBackdropClick} onChange={(event) => setCloseOnBackdropClick(event.target.checked)} disabled={selected.id === 'locked'} />
                  <span className="toggle-track" aria-hidden="true" />
                </label>
                {selected.id === 'locked' && <p className="control-note">This mode overrides both dismissal settings.</p>}
              </div>

              <div className="control-section theme-controls">
                <p className="section-label">SHELL THEME</p>
                <div className="theme-picker" role="group" aria-label="Modal theme">
                  {themes.map((item) => (
                    <button key={item.id} className={`theme-choice theme-${item.id} ${themeId === item.id ? 'is-selected' : ''}`} onClick={() => setThemeId(item.id)} aria-pressed={themeId === item.id}>
                      <span className="theme-swatch" />{item.label}
                    </button>
                  ))}
                </div>
                <p className="control-note">Theme applies to the next dialog opened, including the custom shell example.</p>
              </div>

              <div className="launch-row">
                {selected.id === 'custom' ? <CustomShellExample theme={theme} /> : <button className="button button-primary launch-button" onClick={openSelected}>Open example <span aria-hidden="true">↗</span></button>}
              </div>
            </div>

            <div className="preview-column">
              <div className="preview-topline">
                <span className="section-label">LIVE PREVIEW</span>
                <span className="preview-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
              <div className="preview-stage">
                <div className="preview-window-bar"><span /><span /><span /><code>your-app / modal</code></div>
                <div className="preview-app-content">
                  <div className="preview-rail" />
                  <div className="preview-lines"><i /><i /><i /><i /></div>
                  <div className="preview-action" />
                </div>
                <div className="preview-caption"><span className="status-dot" />{activity}</div>
              </div>
              <div className="portal-target-row">
                <span>PORTAL TARGET</span>
                <div id="preview-portal" ref={portalTarget} className="portal-target" aria-label="Custom portal mount target"><span>#preview-portal</span></div>
              </div>
            </div>
          </section>

          <section className="snippet-section">
            <div className="snippet-heading">
              <div><p className="section-label">IN YOUR APP</p><h3>Implementation</h3></div>
              <button className="copy-button" onClick={copySnippet} aria-label="Copy example code">{copied ? 'Copied' : 'Copy code'}</button>
            </div>
            <pre><code>{snippet}</code></pre>
          </section>
          </>}

          <footer className="page-footer">
            <span>Built for accessible interfaces.</span>
            <span>MIT License <span aria-hidden="true">·</span> TypeScript definitions included</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
