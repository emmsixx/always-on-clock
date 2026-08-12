/**
 * Development-only harness. Stubs the Tauri IPC bridge so both windows can be rendered and
 * driven in a plain browser for visual inspection. Not part of the shipped app — `preview.html`
 * is the only entry that loads it.
 */
const view = new URLSearchParams(location.search).get('view') ?? 'settings';
const label = view === 'overlay' ? 'main' : 'settings';

const store = new Map<string, unknown>();

// Injected by the Tauri runtime in the real app; stubbed here so unlisten teardown is quiet.
(window as unknown as Record<string, unknown>).__TAURI_EVENT_PLUGIN_INTERNALS__ = {
  unregisterListener: () => {},
};

(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
  metadata: {
    currentWindow: { label },
    currentWebview: { windowLabel: label, label },
  },
  transformCallback: (callback: unknown) => {
    const id = Math.floor(Math.random() * 1_000_000);
    (window as unknown as Record<string, unknown>)[`_${id}`] = callback;
    return id;
  },
  invoke: async (cmd: string, args: Record<string, unknown> = {}) => {
    switch (cmd) {
      case 'plugin:store|load':
        return 1;
      case 'plugin:store|get':
        return [store.get(args.key as string), store.has(args.key as string)];
      case 'plugin:store|set':
        store.set(args.key as string, args.value);
        return undefined;
      case 'plugin:event|listen':
        return 1;
      case 'plugin:window|is_always_on_top':
        return false;
      default:
        return undefined;
    }
  },
};

async function main() {
  const [{ default: React }, { createRoot }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
  ]);

  const Surface =
    view === 'overlay'
      ? (await import('./App')).default
      : (await import('./SettingsWindow')).default;

  const root = createRoot(document.getElementById('root') as HTMLElement);

  if (view === 'overlay') {
    // A stand-in desktop, so the overlay's transparency has something to sit on.
    root.render(
      <React.StrictMode>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2b3a52 0%, #6d5f7a 45%, #c9a88b 100%)',
          }}
        >
          <Surface />
        </div>
      </React.StrictMode>,
    );
    return;
  }

  // The settings surface fills the viewport exactly, so the screenshot geometry matches the
  // real 760x560 window rather than a scaled-down frame.
  root.render(
    <React.StrictMode>
      <Surface />
    </React.StrictMode>,
  );
}

void main();
