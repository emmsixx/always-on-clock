import React from 'react';
import { Settings, FONT_SIZES } from '../types/settings';
import { useClockDisplay } from '../hooks/useClockDisplay';
import ClockFace from './ClockFace';

const SIZE_LABEL: Record<Settings['fontSize'], string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  xlarge: 'Huge',
};

/**
 * The fixed anchor of the settings window: the real clock, ticking, composited over a ramp from
 * a bright wallpaper to a dark one. Every appearance control is ultimately a legibility decision,
 * and this is where that decision becomes visible.
 */
const ClockPreview: React.FC<{ settings: Settings }> = ({ settings }) => {
  const { time, date } = useClockDisplay(settings);

  const summary = [
    settings.timeFormat === '12h' ? '12-hour' : '24-hour',
    SIZE_LABEL[settings.fontSize],
    settings.showSeconds ? 'seconds' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="preview" aria-label="Clock preview">
      <div className="preview-caption">
        <span className="preview-caption-title">Live preview</span>
        <span className="preview-caption-meta">{summary}</span>
      </div>
      <div className="preview-stage">
        <div className="preview-ramp" aria-hidden="true" />
        <span className="preview-edge preview-edge--light">bright wallpaper</span>
        <span className="preview-edge preview-edge--dark">dark wallpaper</span>
        <ClockFace
          time={time}
          date={date}
          fontSize={FONT_SIZES[settings.fontSize]}
          textColor={settings.textColor}
          textOpacity={settings.textOpacity}
          backgroundColor={settings.backgroundColor}
          backgroundOpacity={settings.backgroundOpacity}
          scale={1.1}
          className="preview-clock"
        />
      </div>
    </section>
  );
};

export default ClockPreview;
