import { useState, useEffect, useMemo } from "react";
import { useSettings } from "./contexts/SettingsContext";
import { FONT_SIZES } from "./types/settings";

const Clock = () => {
  const { settings, isLoading } = useSettings();

  const getCurrentTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settings.timeFormat === "12h",
    };
    if (settings.showSeconds) {
      options.second = "2-digit";
    }
    return now.toLocaleTimeString("en-US", options);
  };

  const getCurrentDate = () => {
    const now = new Date();
    switch (settings.dateFormat) {
      case "short":
        return now.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
      case "long":
        return now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      case "full":
        return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      default:
        return null;
    }
  };

  const [time, setTime] = useState(getCurrentTime());
  const [date, setDate] = useState(getCurrentDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
      setDate(getCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.timeFormat, settings.showSeconds, settings.dateFormat]);

  const fontSize = FONT_SIZES[settings.fontSize];

  const bgColorWithOpacity = useMemo(() => {
    const hex = settings.backgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${settings.backgroundOpacity})`;
  }, [settings.backgroundColor, settings.backgroundOpacity]);

  if (isLoading) {
    return <div className="p-2 text-gray-400">Loading...</div>;
  }

  return (
    <div
      className="font-black w-fit p-2 pointer-events-none transition-all duration-200"
      style={{
        backgroundColor: bgColorWithOpacity,
        fontSize,
      }}
    >
      <span
        className="drop-shadow-[0_1.8px_1.8px_rgba(0,0,0,0.8)] block"
        style={{
          color: settings.textColor,
          opacity: settings.textOpacity,
        }}
      >
        {time}
      </span>
      {date && (
        <span
          className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] block text-center"
          style={{
            color: settings.textColor,
            opacity: settings.textOpacity * 0.8,
            fontSize: `calc(${fontSize} * 0.5)`,
          }}
        >
          {date}
        </span>
      )}
    </div>
  );
};

export default Clock;