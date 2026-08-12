import React from 'react';

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formats the value for display; defaults to a percentage of the min–max span. */
  format?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (raw) => `${Math.round(((raw - min) / (max - min)) * 100)}%`,
}) => {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider">
      <div className="slider-head">
        <label className="slider-label" htmlFor={id}>
          {label}
        </label>
        <output className="slider-value" htmlFor={id}>
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
      />
    </div>
  );
};

export default Slider;
