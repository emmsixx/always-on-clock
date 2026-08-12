import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';
import {
  getSettingName,
  getStore,
  LEGACY_SETTINGS_KEY,
  loadSettings,
  saveSettings,
} from '../utils/storage';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';

const SETTINGS_UPDATED_EVENT = 'settings-updated';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
  /** Timestamp of the most recent write, so the UI can acknowledge it. */
  lastSavedAt: number | null;
  saveError: string | null;
}

/** Window geometry is remembered state, not a preference, so a reset leaves it alone. */
const PRESERVED_ON_RESET: Array<keyof Settings> = ['windowPosition', 'windowSize'];

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const settingsRef = useRef(settings);
  const registeredShortcutRef = useRef<string | null>(null);
  const shortcutOperationRef = useRef<Promise<void>>(Promise.resolve());
  const saveOperationRef = useRef<Promise<void>>(Promise.resolve());
  const settingsUpdateVersionRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    let disposed = false;
    let unlistenStore: (() => void) | null = null;
    let unlistenSettingsEvent: (() => void) | null = null;
    const pendingUpdates: Partial<Settings> = {};

    const applyUpdates = (updates: Partial<Settings>) => {
      Object.assign(pendingUpdates, updates);
      setSettings((previous) => ({ ...previous, ...updates }));
    };

    const initialize = async () => {
      let loaded = DEFAULT_SETTINGS;

      try {
        const settingsEventCleanup = await listen<Partial<Settings>>(
          SETTINGS_UPDATED_EVENT,
          ({ payload }) => {
            if (disposed || !payload || typeof payload !== 'object') return;
            applyUpdates(payload);
          },
        );

        if (disposed) {
          settingsEventCleanup();
          return;
        }

        unlistenSettingsEvent = settingsEventCleanup;

        const store = await getStore();
        const cleanup = await store.onChange<unknown>((key, value) => {
          if (disposed) return;

          if (key === LEGACY_SETTINGS_KEY && value && typeof value === 'object') {
            const updates = value as Partial<Settings>;
            applyUpdates(updates);
            return;
          }

          const settingName = getSettingName(key);
          if (!settingName) return;

          const nextValue = value === undefined ? DEFAULT_SETTINGS[settingName] : value;
          applyUpdates({ [settingName]: nextValue } as Partial<Settings>);
        });

        if (disposed) {
          cleanup();
          unlistenSettingsEvent?.();
          return;
        }

        unlistenStore = cleanup;
        loaded = await loadSettings();
      } catch (err) {
        console.error('Failed to initialize settings:', err);
        loaded = await loadSettings();
      }

      if (!disposed) {
        setSettings({ ...loaded, ...pendingUpdates });
        setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      disposed = true;
      unlistenStore?.();
      unlistenSettingsEvent?.();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (getCurrentWindow().label !== 'main') return;

    const setupAutostart = async () => {
      const enabled = await isEnabled();
      if (settings.launchOnStartup && !enabled) {
        await enable();
      } else if (!settings.launchOnStartup && enabled) {
        await disable();
      }
    };

    setupAutostart().catch(console.error);
  }, [settings.launchOnStartup, isLoading]);

  useEffect(() => {
    if (isLoading || getCurrentWindow().label !== 'main') return undefined;

    const shortcut = settings.globalShortcut.trim();
    let cancelled = false;
    const previousOperation = shortcutOperationRef.current;

    const reconcileShortcut = async () => {
      await previousOperation.catch(() => undefined);

      const previousShortcut = registeredShortcutRef.current;
      if (previousShortcut) {
        try {
          await unregister(previousShortcut);
        } catch (err) {
          console.warn('Failed to unregister previous shortcut:', err);
          return;
        }
        registeredShortcutRef.current = null;
      }

      if (cancelled || !shortcut) return;

      try {
        await register(shortcut, async (event) => {
          if (event.state !== 'Pressed') return;

          const win = getCurrentWindow();
          const visible = await win.isVisible();
          if (visible) {
            await win.hide();
          } else {
            await win.show();
            await win.setFocus();
          }
        });

        if (cancelled) {
          await unregister(shortcut).catch((err) => {
            console.warn('Failed to clean up shortcut registration:', err);
          });
        } else {
          registeredShortcutRef.current = shortcut;
        }
      } catch (err) {
        console.error('Failed to register shortcut:', err);
      }
    };

    shortcutOperationRef.current = reconcileShortcut();

    return () => {
      cancelled = true;
    };
  }, [settings.globalShortcut, isLoading]);

  useEffect(() => {
    return () => {
      const previousOperation = shortcutOperationRef.current;
      const shutdownOperation = (async () => {
        await previousOperation.catch(() => undefined);

        const shortcut = registeredShortcutRef.current;
        if (!shortcut) return;

        try {
          await unregister(shortcut);
          registeredShortcutRef.current = null;
        } catch (err) {
          console.warn('Failed to unregister shortcut on shutdown:', err);
        }
      })();

      shortcutOperationRef.current = shutdownOperation;
    };
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const previousSettings = settingsRef.current;
    const nextSettings = { ...previousSettings, ...updates };
    const updateVersion = ++settingsUpdateVersionRef.current;
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    setSaveError(null);

    const saveOperation = saveOperationRef.current
      .catch(() => undefined)
      .then(() => saveSettings(updates));
    saveOperationRef.current = saveOperation;

    try {
      await saveOperation;
    } catch (err) {
      if (
        updateVersion === settingsUpdateVersionRef.current &&
        settingsRef.current === nextSettings
      ) {
        settingsRef.current = previousSettings;
        setSettings(previousSettings);
        setSaveError('Could not save changes. Try again.');
      }
      throw err;
    }

    setLastSavedAt(Date.now());

    try {
      await emit(SETTINGS_UPDATED_EVENT, updates);
    } catch (err) {
      console.warn('Failed to synchronize settings between windows:', err);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    const updates = (Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>).reduce<Partial<Settings>>(
      (acc, key) => {
        if (PRESERVED_ON_RESET.includes(key)) return acc;
        return Object.assign(acc, { [key]: DEFAULT_SETTINGS[key] });
      },
      {},
    );

    await updateSettings(updates);
  }, [updateSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, isLoading, lastSavedAt, saveError }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
