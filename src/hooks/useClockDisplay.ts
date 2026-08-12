import { useEffect, useMemo, useState } from 'react';
import { Settings } from '../types/settings';
import { formatDate, formatTime } from '../utils/clockFormat';

/**
 * Ticks once a second and derives the displayed strings from the current settings, so the
 * overlay and the settings preview always read from the same clock.
 */
export function useClockDisplay(settings: Settings) {
  const [now, setNow] = useState(() => new Date());
  const { timeFormat, showSeconds, dateFormat } = settings;

  useEffect(() => {
    let timer: number | undefined;
    const unit = showSeconds ? 1000 : 60_000;

    const schedule = () => {
      const delay = unit - (Date.now() % unit);
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [showSeconds]);

  return useMemo(
    () => ({
      time: formatTime(now, { timeFormat, showSeconds }),
      date: formatDate(now, { dateFormat }),
    }),
    [now, timeFormat, showSeconds, dateFormat],
  );
}
