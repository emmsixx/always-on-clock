import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { THEMES, FONT_SIZES, TimeFormat, DateFormat, FontSize } from '../types/settings';

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

  const sectionStyle: React.CSSProperties = { padding: '20px 28px', borderBottom: '2px solid #444' };
  const lastSectionStyle: React.CSSProperties = { padding: '20px 28px' };

  return (
    <div>
      {/* Time Format */}
      <section style={sectionStyle}>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Time Format</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleTimeFormatChange('12h')}
            aria-pressed={settings.timeFormat === '12h'}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm transition-colors ${
              settings.timeFormat === '12h'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            12-hour
          </button>
          <button
            onClick={() => handleTimeFormatChange('24h')}
            aria-pressed={settings.timeFormat === '24h'}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm transition-colors ${
              settings.timeFormat === '24h'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            24-hour
          </button>
        </div>
      </section>

      {/* Show Seconds */}
      <section style={sectionStyle}>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-300">Show Seconds</span>
          <input
            type="checkbox"
            checked={settings.showSeconds}
            onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </section>

      {/* Date Format */}
      <section style={sectionStyle}>
        <h3 id="date-display-label" className="text-sm font-medium text-gray-300 mb-3">Date Display</h3>
        <select
          id="date-format"
          value={settings.dateFormat}
          onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
          aria-labelledby="date-display-label"
          className="w-full py-2.5 px-4 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="none">Hidden</option>
          <option value="short">Short (12/17)</option>
          <option value="long">Long (Dec 17, 2025)</option>
          <option value="full">Full (Wednesday, December 17)</option>
        </select>
      </section>

      {/* Font Size */}
      <section style={sectionStyle}>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Font Size</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {(Object.keys(FONT_SIZES) as FontSize[]).map((size) => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              aria-pressed={settings.fontSize === size}
              className={`py-2.5 px-2 rounded-lg text-xs capitalize transition-colors ${
                settings.fontSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section style={sectionStyle}>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Theme</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              aria-pressed={settings.activeTheme === theme.id}
              className={`py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                settings.activeTheme === theme.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-gray-500 shrink-0"
                style={{ backgroundColor: theme.textColor }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </section>

      {/* Custom Colors (only when custom theme is selected) */}
      {settings.activeTheme === 'custom' && (
        <section className="space-y-4" style={sectionStyle}>
          <h3 className="text-sm font-medium text-gray-300">Custom Colors</h3>
          <div className="flex items-center justify-between">
            <label htmlFor="custom-text-color" className="text-sm text-gray-400">Text Color</label>
            <input
              id="custom-text-color"
              type="color"
              value={settings.textColor}
              onChange={(e) => updateSettings({ textColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="custom-background-color" className="text-sm text-gray-400">Background Color</label>
            <input
              id="custom-background-color"
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
        </section>
      )}

      {/* Opacity */}
      <section className="space-y-4" style={sectionStyle}>
        <h3 id="opacity-label" className="text-sm font-medium text-gray-300">Opacity</h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="background-opacity" className="text-sm text-gray-400">Background</label>
            <span className="text-sm text-gray-400">{Math.round(settings.backgroundOpacity * 100)}%</span>
          </div>
          <input
            id="background-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.backgroundOpacity}
            onChange={(e) => updateSettings({ backgroundOpacity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="text-opacity" className="text-sm text-gray-400">Text</label>
            <span className="text-sm text-gray-400">{Math.round(settings.textOpacity * 100)}%</span>
          </div>
          <input
            id="text-opacity"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.textOpacity}
            onChange={(e) => updateSettings({ textOpacity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </section>

      {/* Global Shortcut */}
      <section style={sectionStyle}>
        <h3 id="global-shortcut-label" className="text-sm font-medium text-gray-300 mb-3">Global Shortcut</h3>
        <input
          id="global-shortcut"
          type="text"
          value={settings.globalShortcut}
          onChange={(e) => updateSettings({ globalShortcut: e.target.value })}
          aria-labelledby="global-shortcut-label"
          aria-describedby="global-shortcut-help"
          placeholder="e.g., CommandOrControl+Shift+C"
          className="w-full py-2.5 px-4 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        />
        <p id="global-shortcut-help" className="text-xs text-gray-400 mt-2">Toggle window visibility</p>
      </section>

      {/* Launch on Startup */}
      <section style={lastSectionStyle}>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-300">Launch on Startup</span>
          <input
            type="checkbox"
            checked={settings.launchOnStartup}
            onChange={(e) => updateSettings({ launchOnStartup: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </section>
    </div>
  );
};

export default Settings;
