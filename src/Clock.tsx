import { useSettings } from "./contexts/SettingsContext";
import { FONT_SIZES } from "./types/settings";
import { useClockDisplay } from "./hooks/useClockDisplay";
import ClockFace from "./components/ClockFace";

const Clock = () => {
  const { settings, isLoading } = useSettings();
  const { time, date } = useClockDisplay(settings);

  if (isLoading) {
    return <div className="clock-placeholder" aria-hidden="true" />;
  }

  return (
    <ClockFace
      time={time}
      date={date}
      fontSize={FONT_SIZES[settings.fontSize]}
      textColor={settings.textColor}
      textOpacity={settings.textOpacity}
      backgroundColor={settings.backgroundColor}
      backgroundOpacity={settings.backgroundOpacity}
      className="clock-face--overlay"
    />
  );
};

export default Clock;
