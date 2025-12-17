import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS, THEMES } from '../types/settings';
import { loadSettings, saveSettings } from '../utils/storage';
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

  useEffect(() => {
    loadSettings()
      .then((loaded) => {
        setSettings(loaded);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading) return;

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
    if (isLoading || !settings.globalShortcut) return;

    const setupShortcut = async () => {
      try {
        await register(settings.globalShortcut, async () => {
          const win = getCurrentWindow();
          const visible = await win.isVisible();
          if (visible) {
            await win.hide();
          } else {
            await win.show();
            await win.setFocus();
          }
        });
      } catch (err) {
        console.error('Failed to register shortcut:', err);
      }
    };

    setupShortcut();

    return () => {
      unregister(settings.globalShortcut).catch(console.error);
    };
  }, [settings.globalShortcut, isLoading]);

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
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, applyTheme, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}
