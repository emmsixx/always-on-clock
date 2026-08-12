/**
 * Development-only harness. Stubs the Tauri IPC bridge so both windows can be rendered and
 * driven in a plain browser for visual inspection. Not part of the shipped app — `preview.html`
 * is the only entry that loads it.
 */
const view = new URLSearchParams(location.search).get('view') ?? 'settings';
const label = view === 'overlay' ? 'main' : 'settings';

const store = new Map<string, unknown>();
const callbacks = new Map<number, (event: unknown) => void>();
const eventListeners = new Map<string, Set<number>>();
const windowState = {
  position: { x: 0, y: 0 },
  size: { width: 300, height: 200 },
  visible: true,
  alwaysOnTop: false,
};
let nextCallbackId = 1;

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
    const id = nextCallbackId++;
    if (typeof callback === 'function') {
      callbacks.set(id, callback as (event: unknown) => void);
    }
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
      case 'plugin:store|save':
        return undefined;
      case 'plugin:event|listen':
        {
          const event = args.event as string;
          const callbackId = args.handler as number;
          const listeners = eventListeners.get(event) ?? new Set<number>();
          listeners.add(callbackId);
          eventListeners.set(event, listeners);
          return callbackId;
        }
      case 'plugin:event|emit':
        {
          const event = args.event as string;
          for (const callbackId of eventListeners.get(event) ?? []) {
            callbacks.get(callbackId)?.({ event, id: callbackId, payload: args.payload });
          }
          return null;
        }
      case 'plugin:event|unlisten':
        {
          const event = args.event as string;
          const callbackId = args.eventId as number;
          eventListeners.get(event)?.delete(callbackId);
          callbacks.delete(callbackId);
          return undefined;
        }
      case 'plugin:window|is_always_on_top':
        return windowState.alwaysOnTop;
      case 'plugin:window|is_visible':
        return windowState.visible;
      case 'plugin:window|show':
        windowState.visible = true;
        return undefined;
      case 'plugin:window|hide':
        windowState.visible = false;
        return undefined;
      case 'plugin:window|close':
      case 'plugin:window|set_focus':
      case 'plugin:window|set_resizable':
      case 'plugin:window|set_ignore_cursor_events':
      case 'plugin:window|start_dragging':
        return undefined;
      case 'plugin:window|set_always_on_top':
        windowState.alwaysOnTop = Boolean(args.value);
        return undefined;
      case 'plugin:window|inner_position':
        return windowState.position;
      case 'plugin:window|inner_size':
        return windowState.size;
      case 'plugin:window|scale_factor':
        return 1;
      case 'plugin:window|set_position':
        windowState.position = args.value as { x: number; y: number };
        return undefined;
      case 'plugin:window|set_size':
        windowState.size = args.value as { width: number; height: number };
        return undefined;
      case 'plugin:window|get_all_windows':
        return [];
      case 'plugin:window|current_monitor':
      case 'plugin:window|create':
        return null;
      case 'plugin:webview|create_webview_window':
        return undefined;
      case 'plugin:app|default_window_icon':
        return null;
      case 'plugin:menu|new':
        return [1, 'preview-menu'];
      case 'plugin:tray|new':
        return [2, 'preview-tray'];
      case 'plugin:tray|set_visible':
      case 'plugin:tray|set_menu':
      case 'plugin:opener|open_url':
      case 'plugin:opener|open_path':
      case 'plugin:opener|reveal_item_in_dir':
        return undefined;
      case 'plugin:autostart|is_enabled':
        return false;
      case 'plugin:autostart|enable':
      case 'plugin:autostart|disable':
      case 'plugin:global-shortcut|register':
      case 'plugin:global-shortcut|unregister':
      case 'plugin:global-shortcut|unregister_all':
        return undefined;
      default:
        throw new Error(`Preview IPC command is not stubbed: ${cmd}`);
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
