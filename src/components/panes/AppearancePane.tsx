import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { FontSize, THEMES } from '../../types/settings';
import { Field, Group } from '../ui/Field';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import ColorField from '../ui/ColorField';
import ThemePicker from '../ThemePicker';

const AppearancePane: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (themeId: string) => {
    const theme = THEMES.find((item) => item.id === themeId);

    if (!theme || themeId === 'custom') {
      void updateSettings({ activeTheme: themeId }).catch(() => undefined);
      return;
    }

    void updateSettings({
      activeTheme: themeId,
      textColor: theme.textColor,
      backgroundColor: theme.backgroundColor,
      backgroundOpacity: theme.backgroundOpacity,
    }).catch(() => undefined);
  };

  // Editing a color directly means the preset no longer describes the clock, so the selection
  // follows the edit into Custom rather than lying about it.
  const updateColor = (updates: { textColor?: string; backgroundColor?: string }) => {
    void updateSettings({ ...updates, activeTheme: 'custom' }).catch(() => undefined);
  };

  return (
    <Group>
      <Field label="Size" hint="Scales the whole readout, date included.">
        {(hintId) => (
          <Segmented<FontSize>
            label="Font size"
            value={settings.fontSize}
            describedBy={hintId}
            onChange={(fontSize) => void updateSettings({ fontSize }).catch(() => undefined)}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'xlarge', label: 'Huge' },
            ]}
          />
        )}
      </Field>

      <Field label="Theme" hint="A starting point. Editing a color moves you to Custom.">
        {(hintId) => (
          <ThemePicker
            activeTheme={settings.activeTheme}
            customTextColor={settings.textColor}
            customBackgroundColor={settings.backgroundColor}
            customBackgroundOpacity={settings.backgroundOpacity}
            describedBy={hintId}
            onSelect={handleThemeChange}
          />
        )}
      </Field>

      <Field label="Colors" hint="Text, and the panel it sits on.">
        {(hintId) => (
          <div className="color-row">
            <ColorField
              id="custom-text-color"
              label="Text"
              value={settings.textColor}
              describedBy={hintId}
              onChange={(textColor) => updateColor({ textColor })}
            />
            <ColorField
              id="custom-background-color"
              label="Background"
              value={settings.backgroundColor}
              describedBy={hintId}
              onChange={(backgroundColor) => updateColor({ backgroundColor })}
            />
          </div>
        )}
      </Field>

      <Field
        label="Transparency"
        hint="Drop the background to nothing for a bare readout; drop the text to let the desktop win."
      >
        {(hintId) => (
          <div className="slider-stack">
            <Slider
              id="background-opacity"
              label="Background"
              value={settings.backgroundOpacity}
              min={0}
              max={1}
              step={0.05}
              describedBy={hintId}
              onChange={(backgroundOpacity) =>
                void updateSettings({ backgroundOpacity, activeTheme: 'custom' }).catch(
                  () => undefined,
                )
              }
            />
            <Slider
              id="text-opacity"
              label="Text"
              value={settings.textOpacity}
              min={0.1}
              max={1}
              step={0.05}
              describedBy={hintId}
              onChange={(textOpacity) =>
                void updateSettings({ textOpacity }).catch(() => undefined)
              }
              format={(value) => `${Math.round(value * 100)}%`}
            />
          </div>
        )}
      </Field>
    </Group>
  );
};

export default AppearancePane;
