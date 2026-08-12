import { Settings } from '../types/settings';

type TimeOptions = Pick<Settings, 'timeFormat' | 'showSeconds'>;
type DateOptions = Pick<Settings, 'dateFormat'>;

export function formatTime(now: Date, { timeFormat, showSeconds }: TimeOptions): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  };

  if (showSeconds) {
    options.second = '2-digit';
  }

  return now.toLocaleTimeString('en-US', options);
}

export function formatDate(now: Date, { dateFormat }: DateOptions): string | null {
  switch (dateFormat) {
    case 'short':
      return now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'long':
      return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'full':
      return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    default:
      return null;
  }
}

/**
 * Converts a `#rrggbb` value plus an alpha into an `rgba()` string, falling back to the raw
 * color when the input is not a hex triplet (a hand-typed custom color mid-edit, for example).
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return color;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
