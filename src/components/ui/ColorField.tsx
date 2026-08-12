import React, { useEffect, useState } from 'react';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  describedBy?: string;
}

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Swatch plus an editable hex field. The text input keeps its own draft so a partially typed
 * value never reaches settings; it commits on a valid hex and reverts on blur if left invalid.
 */
const ColorField: React.FC<ColorFieldProps> = ({ id, label, value, onChange, describedBy }) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft((current) => (current.toLowerCase() === value.toLowerCase() ? current : value));
  }, [value]);

  const handleTextChange = (next: string) => {
    const normalized = next === '' ? '' : next.startsWith('#') ? next : `#${next}`;
    setDraft(normalized);
    if (HEX.test(normalized)) {
      onChange(normalized.toLowerCase());
    }
  };

  return (
    <div className="color-field">
      <label className="color-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="color-field-controls">
        <input
          type="text"
          className="color-field-hex"
          value={draft}
          spellCheck={false}
          maxLength={7}
          aria-describedby={describedBy}
          aria-label={`${label} hex value`}
          onChange={(event) => handleTextChange(event.target.value)}
          onBlur={() => setDraft(value)}
        />
        <span className="color-field-swatch" style={{ backgroundColor: value }}>
          <input
            id={id}
            type="color"
            className="color-field-picker"
            value={HEX.test(value) ? value : '#000000'}
            onChange={(event) => onChange(event.target.value)}
            aria-label={label}
            aria-describedby={describedBy}
          />
        </span>
      </div>
    </div>
  );
};

export default ColorField;
