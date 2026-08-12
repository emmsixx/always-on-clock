import React from 'react';
import { MousePointerClick } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { DEFAULT_SETTINGS } from '../../types/settings';
import { Field, Group, ToggleField } from '../ui/Field';
import ShortcutRecorder from '../ShortcutRecorder';

const BehaviorPane: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <Group>
      <Field
        label="Global shortcut"
        hint="Shows and hides the clock from any application."
      >
        {(hintId) => (
          <ShortcutRecorder
            value={settings.globalShortcut}
            defaultValue={DEFAULT_SETTINGS.globalShortcut}
            describedBy={hintId}
            onChange={(globalShortcut) => updateSettings({ globalShortcut })}
          />
        )}
      </Field>

      <ToggleField
        label="Launch on startup"
        hint="Opens the clock when you sign in, already where you left it."
        checked={settings.launchOnStartup}
        onChange={(launchOnStartup) =>
          void updateSettings({ launchOnStartup }).catch(() => undefined)
        }
      />

      <div className="note">
        <span className="note-icon" aria-hidden="true">
          <MousePointerClick size={14} strokeWidth={2.1} />
        </span>
        <p>
          Pinning the clock from its title bar puts it above every window and makes it
          click-through, so it stops catching your cursor. While pinned, its controls move to the
          system tray icon.
        </p>
      </div>
    </Group>
  );
};

export default BehaviorPane;
