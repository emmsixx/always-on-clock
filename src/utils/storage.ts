import { load, Store } from '@tauri-apps/plugin-store';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';

const STORE_NAME = 'settings.json';
export const LEGACY_SETTINGS_KEY = 'settings';
export const SETTINGS_KEY_PREFIX = 'settings.';
export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>;
let store: Store | null = null;

export async function getStore(): Promise<Store> {
  if (!store) {
    store = await load(STORE_NAME);
  }
  return store;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const s = await getStore();
    const saved = await s.get<Partial<Settings>>(LEGACY_SETTINGS_KEY);
    const overrides = await Promise.all(
      SETTINGS_KEYS.map(async (key) => ({
        key,
        value: await s.get<Settings[typeof key]>(`${SETTINGS_KEY_PREFIX}${key}`),
      })),
    );

    const settings = { ...DEFAULT_SETTINGS, ...saved };
    for (const { key, value } of overrides) {
      if (value !== undefined) {
        Object.assign(settings, { [key]: value });
      }
    }

    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(updates: Partial<Settings>): Promise<void> {
  try {
    const s = await getStore();
    await Promise.all(
      SETTINGS_KEYS.filter((key) => updates[key] !== undefined).map((key) =>
        s.set(`${SETTINGS_KEY_PREFIX}${key}`, updates[key]),
      ),
    );
    await s.save();
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getSettingName(key: string): keyof Settings | null {
  if (!key.startsWith(SETTINGS_KEY_PREFIX)) return null;

  const name = key.slice(SETTINGS_KEY_PREFIX.length) as keyof Settings;
  return SETTINGS_KEYS.includes(name) ? name : null;
}
