import { getCurrentWindow } from "@tauri-apps/api/window";
import { X } from "lucide-react";
import { SettingsProvider } from "./contexts/SettingsContext";
import Settings from "./components/Settings";
import "./globals.css";

const SettingsWindowContent: React.FC = () => {
  const handleClose = async () => {
    const win = getCurrentWindow();
    await win.close();
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen overflow-y-auto">
      <div
        data-tauri-drag-region
        className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 bg-[#1a1a1a] cursor-move"
      >
        <h2 className="text-lg font-semibold text-white pointer-events-none">Settings</h2>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
          title="Close settings"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <Settings />
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
