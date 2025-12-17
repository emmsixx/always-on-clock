export type TimeFormat = '12h' | '24h';
export type DateFormat = 'none' | 'short' | 'long' | 'full';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface Theme {
  id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
}

export interface Settings {
  timeFormat: TimeFormat;
  showSeconds: boolean;
  dateFormat: DateFormat;
  fontSize: FontSize;
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textOpacity: number;
  activeTheme: string;
  windowPosition: { x: number; y: number } | null;
  windowSize: { width: number; height: number } | null;
  globalShortcut: string;
  launchOnStartup: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  timeFormat: '12h',
  showSeconds: false,
  dateFormat: 'none',
  fontSize: 'medium',
  textColor: '#fefefe',
  backgroundColor: '#ffffff',
  backgroundOpacity: 0.25,
  textOpacity: 1,
  activeTheme: 'dark',
  windowPosition: null,
  windowSize: null,
  globalShortcut: 'CommandOrControl+Shift+C',
  launchOnStartup: false,
};

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    textColor: '#fefefe',
    backgroundColor: '#000000',
    backgroundOpacity: 0.25,
  },
  {
    id: 'light',
    name: 'Light',
    textColor: '#1a1a1a',
    backgroundColor: '#ffffff',
    backgroundOpacity: 0.85,
  },
  {
    id: 'neon',
    name: 'Neon',
    textColor: '#00ff88',
    backgroundColor: '#0a0a0a',
    backgroundOpacity: 0.3,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 0,
  },
  {
    id: 'custom',
    name: 'Custom',
    textColor: '#fefefe',
    backgroundColor: '#ffffff',
    backgroundOpacity: 0.25,
  },
];

export const FONT_SIZES: Record<FontSize, string> = {
  small: '1rem',
  medium: '1.25rem',
  large: '1.75rem',
  xlarge: '2.5rem',
};
