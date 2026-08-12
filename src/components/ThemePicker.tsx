import React from 'react';
import { Check } from 'lucide-react';
import { THEMES } from '../types/settings';
import { withAlpha } from '../utils/clockFormat';

interface ThemePickerProps {
  activeTheme: string;
  /** The live custom colors, so the Custom tile previews what it will actually apply. */
  customTextColor: string;
  customBackgroundColor: string;
  customBackgroundOpacity: number;
  onSelect: (themeId: string) => void;
}

/**
 * Each preset renders its own sample rather than a color dot, so the choice is made by looking
 * at the result. Samples sit on the same light/dark seam as the main preview.
 */
const ThemePicker: React.FC<ThemePickerProps> = ({
  activeTheme,
  customTextColor,
  customBackgroundColor,
  customBackgroundOpacity,
  onSelect,
}) => (
  <div className="theme-grid" role="radiogroup" aria-label="Theme">
    {THEMES.map((theme) => {
      const isCustom = theme.id === 'custom';
      const textColor = isCustom ? customTextColor : theme.textColor;
      const backgroundColor = isCustom ? customBackgroundColor : theme.backgroundColor;
      const backgroundOpacity = isCustom ? customBackgroundOpacity : theme.backgroundOpacity;
      const isSelected = activeTheme === theme.id;

      return (
        <button
          key={theme.id}
          type="button"
          role="radio"
          aria-checked={isSelected}
          className={`theme-tile ${isSelected ? 'is-selected' : ''}`.trim()}
          onClick={() => onSelect(theme.id)}
        >
          <span className="theme-tile-stage">
            <span className="theme-tile-ramp" aria-hidden="true" />
            <span
              className="theme-tile-sample"
              style={{ backgroundColor: withAlpha(backgroundColor, backgroundOpacity) }}
            >
              <span style={{ color: textColor }}>12:00</span>
            </span>
          </span>
          <span className="theme-tile-name">
            {theme.name}
            {isSelected && <Check size={13} strokeWidth={2.8} aria-hidden="true" />}
          </span>
        </button>
      );
    })}
  </div>
);

export default ThemePicker;
