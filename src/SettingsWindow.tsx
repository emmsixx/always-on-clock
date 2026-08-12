import { getCurrentWindow } from "@tauri-apps/api/window";
import { Clock3, X } from "lucide-react";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import Settings from "./components/Settings";
import "./globals.css";

const SettingsWindowContent: React.FC = () => {
  const { isLoading } = useSettings();

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.error('Failed to close settings window:', error);
    }
  };

  return (
    <div
      className="settings-window"
    >
      <div
        data-tauri-drag-region
        className="settings-header"
      >
        <div className="settings-brand pointer-events-none">
          <span className="settings-brand-mark" aria-hidden="true">
            <Clock3 size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Always On Clock</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="settings-close-button"
          aria-label="Close settings"
          title="Close settings"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      {isLoading ? (
        <p className="settings-loading">Loading settings…</p>
      ) : (
        <Settings />
      )}
    </div>
  );
};

const SettingsWindow: React.FC = () => {
  return (
    <SettingsProvider>
      <SettingsWindowContent />
    </SettingsProvider>
  );
};

export default SettingsWindow;
