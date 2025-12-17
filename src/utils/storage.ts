import { load, Store } from '@tauri-apps/plugin-store';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';

const STORE_NAME = 'settings.json';
let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load(STORE_NAME);
  }
  return store;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const s = await getStore();
    const saved = await s.get<Partial<Settings>>('settings');
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    const s = await getStore();
    await s.set('settings', settings);
    await s.save();
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
