import React, { useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { DateFormat, TimeFormat } from '../../types/settings';
import { formatDate } from '../../utils/clockFormat';
import { Field, Group, ToggleField } from '../ui/Field';
import Segmented from '../ui/Segmented';
import Select from '../ui/Select';

const ClockPane: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  // Label each date option with today's date in that format, so the choice is read rather than
  // imagined.
  const dateOptions = useMemo(() => {
    const now = new Date();
    return [
      { value: 'none' as DateFormat, label: 'No date' },
      { value: 'short' as DateFormat, label: 'Short', detail: formatDate(now, { dateFormat: 'short' }) ?? '' },
      { value: 'long' as DateFormat, label: 'Long', detail: formatDate(now, { dateFormat: 'long' }) ?? '' },
      { value: 'full' as DateFormat, label: 'Full', detail: formatDate(now, { dateFormat: 'full' }) ?? '' },
    ];
  }, []);

  return (
    <Group>
      <Field label="Time format" hint="Match the clock you already read everywhere else.">
        <Segmented<TimeFormat>
          label="Time format"
          value={settings.timeFormat}
          onChange={(timeFormat) => updateSettings({ timeFormat })}
          options={[
            { value: '12h', label: '12-hour', sample: '2:45 PM' },
            { value: '24h', label: '24-hour', sample: '14:45' },
          ]}
        />
      </Field>

      <ToggleField
        label="Show seconds"
        hint="Adds a ticking seconds field. Useful for timing, busier at a glance."
        checked={settings.showSeconds}
        onChange={(showSeconds) => updateSettings({ showSeconds })}
      />

      <Field
        label="Date"
        hint="Sits beneath the time in a smaller weight."
        htmlFor="date-format"
      >
        <Select<DateFormat>
          id="date-format"
          value={settings.dateFormat}
          options={dateOptions}
          onChange={(dateFormat) => updateSettings({ dateFormat })}
        />
      </Field>
    </Group>
  );
};

export default ClockPane;
