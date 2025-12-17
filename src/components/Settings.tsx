import React from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { THEMES, FONT_SIZES, TimeFormat, DateFormat, FontSize } from '../types/settings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, applyTheme } = useSettings();

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg w-[320px] max-h-[90vh] overflow-y-auto shadow-xl border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Close settings"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Time Format */}
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Time Format</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleTimeFormatChange('12h')}
                className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                  settings.timeFormat === '12h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                12-hour
              </button>
              <button
                onClick={() => handleTimeFormatChange('24h')}
                className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
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
          <section>
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
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Date Display</h3>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
              className="w-full py-2 px-3 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="none">Hidden</option>
              <option value="short">Short (12/17)</option>
              <option value="long">Long (Dec 17, 2025)</option>
              <option value="full">Full (Wednesday, December 17)</option>
            </select>
          </section>

          {/* Font Size */}
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Font Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(FONT_SIZES) as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`py-2 px-2 rounded text-xs capitalize transition-colors ${
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
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`py-2 px-3 rounded text-sm transition-colors flex items-center gap-2 ${
                    settings.activeTheme === theme.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-500"
                    style={{ backgroundColor: theme.textColor }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </section>

          {/* Custom Colors (only when custom theme is selected) */}
          {settings.activeTheme === 'custom' && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Custom Colors</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Text Color</span>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Background Color</span>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer bg-transparent"
                />
              </div>
            </section>
          )}

          {/* Opacity */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Opacity</h3>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Background</span>
                <span className="text-sm text-gray-500">{Math.round(settings.backgroundOpacity * 100)}%</span>
              </div>
              <input
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Text</span>
                <span className="text-sm text-gray-500">{Math.round(settings.textOpacity * 100)}%</span>
              </div>
              <input
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
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Global Shortcut</h3>
            <input
              type="text"
              value={settings.globalShortcut}
              onChange={(e) => updateSettings({ globalShortcut: e.target.value })}
              placeholder="e.g., CommandOrControl+Shift+C"
              className="w-full py-2 px-3 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Toggle window visibility</p>
          </section>

          {/* Launch on Startup */}
          <section>
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
      </div>
    </div>
  );
};

export default Settings;
