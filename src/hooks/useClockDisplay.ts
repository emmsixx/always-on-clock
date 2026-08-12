import { useEffect, useMemo, useState } from 'react';
import { Settings } from '../types/settings';
import { formatDate, formatTime } from '../utils/clockFormat';

/**
 * Ticks once a second and derives the displayed strings from the current settings, so the
 * overlay and the settings preview always read from the same clock.
 */
export function useClockDisplay(settings: Settings) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { timeFormat, showSeconds, dateFormat } = settings;

  return useMemo(
    () => ({
      time: formatTime(now, { timeFormat, showSeconds }),
      date: formatDate(now, { dateFormat }),
    }),
    [now, timeFormat, showSeconds, dateFormat],
  );
}
