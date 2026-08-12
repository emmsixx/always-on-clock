import React, { useMemo } from 'react';
import { withAlpha } from '../utils/clockFormat';

export interface ClockFaceAppearance {
  fontSize: string;
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
}

interface ClockFaceProps extends ClockFaceAppearance {
  time: string;
  date: string | null;
  /** Scales padding and the date step together with the type size. */
  scale?: number;
  className?: string;
}

/**
 * The single rendering of the clock. The overlay window and the settings preview both mount
 * this, so what the preview shows is what the desktop gets.
 */
const ClockFace: React.FC<ClockFaceProps> = ({
  time,
  date,
  fontSize,
  textColor,
  textOpacity,
  backgroundColor,
  backgroundOpacity,
  scale = 1,
  className = '',
}) => {
  const background = useMemo(
    () => withAlpha(backgroundColor, backgroundOpacity),
    [backgroundColor, backgroundOpacity],
  );

  return (
    <div
      className={`clock-face ${className}`.trim()}
      style={{
        backgroundColor: background,
        fontSize: `calc(${fontSize} * ${scale})`,
        padding: `${20 * scale}px ${24 * scale}px`,
      }}
    >
      <span
        className="clock-face-time"
        style={{ color: textColor, opacity: textOpacity }}
      >
        {time}
      </span>
      {date && (
        <span
          className="clock-face-date"
          style={{ color: textColor, opacity: textOpacity * 0.8 }}
        >
          {date}
        </span>
      )}
    </div>
  );
};

export default ClockFace;
