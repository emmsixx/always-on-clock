import React, { useId } from 'react';

interface RowProps {
  label: string;
  hint?: string;
  /** Rendered to the right of the label on a single line (toggles, compact values). */
  control?: React.ReactNode;
  /** Rendered full width beneath the label (segmented controls, sliders, grids). */
  children?: React.ReactNode;
  htmlFor?: string;
}

/**
 * One setting. Label and hint on the left, control either inline or stacked beneath —
 * the whole surface uses these two arrangements and nothing else.
 */
export const Field: React.FC<RowProps> = ({ label, hint, control, children, htmlFor }) => {
  const generatedId = useId();
  const hintId = hint ? `${generatedId}-hint` : undefined;

  return (
    <div className={`field ${children ? 'field--stacked' : ''}`.trim()}>
      <div className="field-head">
        <div className="field-copy">
          {htmlFor ? (
            <label className="field-label" htmlFor={htmlFor}>
              {label}
            </label>
          ) : (
            <span className="field-label">{label}</span>
          )}
          {hint && (
            <span className="field-hint" id={hintId}>
              {hint}
            </span>
          )}
        </div>
        {control && <div className="field-control">{control}</div>}
      </div>
      {children && <div className="field-body">{children}</div>}
    </div>
  );
};

/**
 * A whole-row label wrapper for boolean settings, so clicking the description toggles it.
 */
export const ToggleField: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, hint, checked, onChange }) => (
  <label className="field field--pressable">
    <div className="field-head">
      <div className="field-copy">
        <span className="field-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      <div className="field-control">
        <span className="toggle">
          <input
            type="checkbox"
            className="toggle-input"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="toggle-track" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
        </span>
      </div>
    </div>
  </label>
);

export const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="field-group">{children}</div>
);
