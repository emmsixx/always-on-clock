import React from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  Keyboard,
  Palette,
  Rocket,
  SlidersHorizontal,
  Type,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { DEFAULT_SETTINGS, THEMES, FONT_SIZES, TimeFormat, DateFormat, FontSize } from '../types/settings';
import ShortcutRecorder from './ShortcutRecorder';

const SettingCard: React.FC<{
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <section className="settings-card" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>
    <div className="settings-card-header">
      <span className="settings-card-icon" aria-hidden="true">
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <div>
        <h2 id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`} className="settings-card-title">
          {title}
        </h2>
        <p className="settings-card-description">{description}</p>
      </div>
    </div>
    <div className="settings-card-body">{children}</div>
  </section>
);

const Settings: React.FC = () => {
  const { settings, updateSettings, applyTheme } = useSettings();

  const handleTimeFormatChange = (format: TimeFormat) => {
    updateSettings({ timeFormat: format });
  };

  const handleDateFormatChange = (format: DateFormat) => {
    updateSettings({ dateFormat: format });
  };

  const handleFontSizeChange = (size: FontSize) => {
    updateSettings({ fontSize: size });
  };

  const handleThemeChange = (themeId: string) => {
    applyTheme(themeId);
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      updateSettings({
        activeTheme: themeId,
        textColor: theme.textColor,
        backgroundColor: theme.backgroundColor,
        backgroundOpacity: theme.backgroundOpacity,
      });
    }
  };

  const backgroundOpacity = Math.round(settings.backgroundOpacity * 100);
  const textOpacity = Math.round(settings.textOpacity * 100);

  return (
    <main className="settings-content">
      <div className="settings-intro">
        <div className="settings-eyebrow">
          <SlidersHorizontal size={13} strokeWidth={2.3} />
          <span>Personalize your clock</span>
        </div>
        <p>Make the overlay feel at home on your desktop.</p>
      </div>

      <SettingCard
        icon={Clock3}
        title="Clock display"
        description="Choose what the clock shows and how it reads."
      >
        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <span className="settings-label">Time format</span>
              <span className="settings-help">Use the format that feels most natural.</span>
            </div>
            <span className="settings-value">{settings.timeFormat === '12h' ? '12-hour' : '24-hour'}</span>
          </div>
          <div className="segmented-control segmented-control--two" role="group" aria-label="Time format">
            <button
              type="button"
              onClick={() => handleTimeFormatChange('12h')}
              aria-pressed={settings.timeFormat === '12h'}
              className={`segmented-option ${settings.timeFormat === '12h' ? 'is-selected' : ''}`}
            >
              12-hour
            </button>
            <button
              type="button"
              onClick={() => handleTimeFormatChange('24h')}
              aria-pressed={settings.timeFormat === '24h'}
              className={`segmented-option ${settings.timeFormat === '24h' ? 'is-selected' : ''}`}
            >
              24-hour
            </button>
          </div>
        </div>

        <label className="settings-field settings-field--interactive">
          <span className="settings-field-copy">
            <span className="settings-label">Show seconds</span>
            <span className="settings-help">Add seconds to the live time display.</span>
          </span>
          <span className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.showSeconds}
              onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
              className="settings-toggle-input"
              aria-label="Show seconds"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
          </span>
        </label>

        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <label htmlFor="date-format" className="settings-label">Date display</label>
              <span className="settings-help">Keep the date nearby, or keep things minimal.</span>
            </div>
            <CalendarDays size={15} className="settings-muted-icon" aria-hidden="true" />
          </div>
          <div className="settings-select-wrap">
            <select
              id="date-format"
              value={settings.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
              aria-label="Date display"
              className="settings-select"
            >
              <option value="none">Hidden</option>
              <option value="short">Short · 12/17</option>
              <option value="long">Long · Dec 17, 2025</option>
              <option value="full">Full · Wednesday, December 17</option>
            </select>
            <ChevronDown size={16} className="settings-select-icon" aria-hidden="true" />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        icon={Palette}
        title="Appearance"
        description="Shape the scale, color, and transparency of the overlay."
      >
        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <span className="settings-label">Font size</span>
              <span className="settings-help">Set the visual weight of the clock.</span>
            </div>
            <Type size={15} className="settings-muted-icon" aria-hidden="true" />
          </div>
          <div className="segmented-control segmented-control--four" role="group" aria-label="Font size">
            {(Object.keys(FONT_SIZES) as FontSize[]).map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => handleFontSizeChange(size)}
                aria-pressed={settings.fontSize === size}
                className={`segmented-option segmented-option--capitalize ${settings.fontSize === size ? 'is-selected' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <span className="settings-label">Theme</span>
              <span className="settings-help">Start with a preset, then make it yours.</span>
            </div>
            <span className="settings-value">{THEMES.find((theme) => theme.id === settings.activeTheme)?.name}</span>
          </div>
          <div className="theme-grid">
            {THEMES.map((theme) => {
              const isSelected = settings.activeTheme === theme.id;
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  aria-pressed={isSelected}
                  className={`theme-option ${isSelected ? 'is-selected' : ''}`}
                >
                  <span
                    className="theme-swatch"
                    style={{ backgroundColor: theme.textColor }}
                    aria-hidden="true"
                  />
                  <span>{theme.name}</span>
                  {isSelected && <Check size={14} strokeWidth={2.5} className="theme-check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {settings.activeTheme === 'custom' && (
          <div className="settings-subpanel">
            <div className="settings-subpanel-heading">
              <span className="settings-label">Custom colors</span>
              <span className="settings-help">Pick the colors used by your clock.</span>
            </div>
            <div className="settings-color-row">
              <label htmlFor="custom-text-color" className="settings-label">Text color</label>
              <input
                id="custom-text-color"
                type="color"
                value={settings.textColor}
                onChange={(e) => updateSettings({ textColor: e.target.value })}
                className="settings-color-input"
              />
            </div>
            <div className="settings-color-row">
              <label htmlFor="custom-background-color" className="settings-label">Background color</label>
              <input
                id="custom-background-color"
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                className="settings-color-input"
              />
            </div>
          </div>
        )}

        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <span className="settings-label">Opacity</span>
              <span className="settings-help">Balance contrast with the desktop behind it.</span>
            </div>
            <Eye size={15} className="settings-muted-icon" aria-hidden="true" />
          </div>

          <div className="settings-range-group">
            <div className="settings-range-labels">
              <label htmlFor="background-opacity">Background</label>
              <output htmlFor="background-opacity">{backgroundOpacity}%</output>
            </div>
            <input
              id="background-opacity"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.backgroundOpacity}
              onChange={(e) => updateSettings({ backgroundOpacity: parseFloat(e.target.value) })}
              className="settings-range"
              style={{ background: `linear-gradient(90deg, var(--accent) ${backgroundOpacity}%, var(--surface-strong) ${backgroundOpacity}%)` }}
              aria-label="Background opacity"
            />
          </div>
          <div className="settings-range-group">
            <div className="settings-range-labels">
              <label htmlFor="text-opacity">Text</label>
              <output htmlFor="text-opacity">{textOpacity}%</output>
            </div>
            <input
              id="text-opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.textOpacity}
              onChange={(e) => updateSettings({ textOpacity: parseFloat(e.target.value) })}
              className="settings-range"
              style={{ background: `linear-gradient(90deg, var(--accent) ${((settings.textOpacity - 0.1) / 0.9) * 100}%, var(--surface-strong) ${((settings.textOpacity - 0.1) / 0.9) * 100}%)` }}
              aria-label="Text opacity"
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        icon={Rocket}
        title="Behavior"
        description="Control how the app opens and responds around your workflow."
      >
        <div className="settings-field settings-field--stacked">
          <div className="settings-field-heading">
            <div className="settings-field-copy">
              <span id="global-shortcut-label" className="settings-label">Global shortcut</span>
              <span id="global-shortcut-help" className="settings-help">
                Click the field, then press the keys you want to use.
              </span>
            </div>
            <Keyboard size={15} className="settings-muted-icon" aria-hidden="true" />
          </div>
          <ShortcutRecorder
            value={settings.globalShortcut}
            defaultValue={DEFAULT_SETTINGS.globalShortcut}
            onChange={(globalShortcut) => updateSettings({ globalShortcut })}
          />
        </div>

        <label className="settings-field settings-field--interactive">
          <span className="settings-field-copy">
            <span className="settings-label">Launch on startup</span>
            <span className="settings-help">Open the clock automatically when you sign in.</span>
          </span>
          <span className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.launchOnStartup}
              onChange={(e) => updateSettings({ launchOnStartup: e.target.checked })}
              className="settings-toggle-input"
              aria-label="Launch on startup"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
          </span>
        </label>
      </SettingCard>

      <div className="settings-saved-note">
        <span className="settings-saved-icon" aria-hidden="true"><Check size={13} strokeWidth={2.7} /></span>
        <span>Changes save automatically</span>
      </div>
    </main>
  );
};

export default Settings;
