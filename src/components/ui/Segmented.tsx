import React, { useRef } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional second line, e.g. a rendered sample of what the option produces. */
  sample?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
  describedBy?: string;
}

/**
 * Radio-group semantics with a single thumb that slides between positions — the one piece of
 * authored motion in the settings window. Arrow keys move the selection, as a native radio
 * group does.
 */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  describedBy,
}: SegmentedProps<T>) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  const move = (delta: number) => {
    const next = (activeIndex + delta + options.length) % options.length;
    onChange(options[next].value);
    buttonsRef.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    }
  };

  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
      onKeyDown={handleKeyDown}
      style={
        {
          '--segmented-count': options.length,
          '--segmented-index': activeIndex,
        } as React.CSSProperties
      }
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={`segmented-option ${isSelected ? 'is-selected' : ''}`.trim()}
            onClick={() => onChange(option.value)}
          >
            <span className="segmented-label">{option.label}</span>
            {option.sample && <span className="segmented-sample">{option.sample}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
