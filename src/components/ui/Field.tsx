import React, { useId } from 'react';

interface RowProps {
  label: string;
  hint?: string;
  /** Rendered to the right of the label on a single line (toggles, compact values). */
  control?: React.ReactNode | ((hintId: string | undefined) => React.ReactNode);
  /** Rendered full width beneath the label (segmented controls, sliders, grids). */
  children?: React.ReactNode | ((hintId: string | undefined) => React.ReactNode);
  htmlFor?: string;
}

/**
 * One setting. Label and hint on the left, control either inline or stacked beneath —
 * the whole surface uses these two arrangements and nothing else.
 */
export const Field: React.FC<RowProps> = ({ label, hint, control, children, htmlFor }) => {
  const generatedId = useId();
  const hintId = hint ? `${generatedId}-hint` : undefined;
  const renderedControl = typeof control === 'function' ? control(hintId) : control;
  const renderedChildren = typeof children === 'function' ? children(hintId) : children;

  return (
    <div className={`field ${renderedChildren ? 'field--stacked' : ''}`.trim()}>
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
        {renderedControl && <div className="field-control">{renderedControl}</div>}
      </div>
      {renderedChildren && <div className="field-body">{renderedChildren}</div>}
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
}> = ({ label, hint, checked, onChange }) => {
  const hintId = useId();

  return (
    <label className="field field--pressable">
      <div className="field-head">
        <div className="field-copy">
          <span className="field-label">{label}</span>
          {hint && (
            <span className="field-hint" id={hintId}>
              {hint}
            </span>
          )}
        </div>
        <div className="field-control">
          <span className="toggle">
            <input
              type="checkbox"
              className="toggle-input"
              checked={checked}
              aria-describedby={hint ? hintId : undefined}
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
};

export const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="field-group">{children}</div>
);
