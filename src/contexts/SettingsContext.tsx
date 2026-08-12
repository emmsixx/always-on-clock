import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Settings, DEFAULT_SETTINGS, THEMES } from '../types/settings';
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

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  applyTheme: (themeId: string) => void;
  isLoading: boolean;
}

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
  const registeredShortcutRef = useRef<string | null>(null);
  const shortcutOperationRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | null = null;
    const pendingUpdates: Partial<Settings> = {};

    const initialize = async () => {
      let loaded = DEFAULT_SETTINGS;

      try {
        const store = await getStore();
        const cleanup = await store.onChange<unknown>((key, value) => {
          if (disposed) return;

          if (key === LEGACY_SETTINGS_KEY && value && typeof value === 'object') {
            const updates = value as Partial<Settings>;
            Object.assign(pendingUpdates, updates);
            setSettings((previous) => ({ ...previous, ...updates }));
            return;
          }

          const settingName = getSettingName(key);
          if (!settingName) return;

          const nextValue = value === undefined ? DEFAULT_SETTINGS[settingName] : value;
          Object.assign(pendingUpdates, { [settingName]: nextValue });
          setSettings((previous) => ({ ...previous, [settingName]: nextValue }));
        });

        if (disposed) {
          cleanup();
          return;
        }

        unlisten = cleanup;
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
      unlisten?.();
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

  const applyTheme = useCallback((themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme && theme.id !== 'custom') {
      setSettings((prev) => ({
        ...prev,
        activeTheme: themeId,
        textColor: theme.textColor,
        backgroundColor: theme.backgroundColor,
        backgroundOpacity: theme.backgroundOpacity,
      }));
    } else {
      setSettings((prev) => ({ ...prev, activeTheme: themeId }));
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    setSettings((previous) => ({ ...previous, ...updates }));
    await saveSettings(updates);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, applyTheme, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}
