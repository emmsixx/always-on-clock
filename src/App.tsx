import { useEffect } from "react";
import { getCurrentWindow, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import Clock from "./Clock";
import TitleBar from "./TitleBar";
import "./globals.css";

const AppContent: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading) return;

    const initWindow = async () => {
      const win = getCurrentWindow();

      // Restore saved position or use default
      if (settings.windowPosition) {
        await win.setPosition(
          new PhysicalPosition(settings.windowPosition.x, settings.windowPosition.y)
        );
      }

      // Restore saved size
      if (settings.windowSize) {
        await win.setSize(
          new PhysicalSize(settings.windowSize.width, settings.windowSize.height)
        );
      }
    };

    initWindow();
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const win = getCurrentWindow();
    let saveTimeout: number | null = null;

    const handleMove = async () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(async () => {
        const pos = await win.innerPosition();
        updateSettings({ windowPosition: { x: pos.x, y: pos.y } });
      }, 500);
    };

    const handleResize = async () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(async () => {
        const size = await win.innerSize();
        updateSettings({ windowSize: { width: size.width, height: size.height } });
      }, 500);
    };

    const unlistenMove = win.onMoved(handleMove);
    const unlistenResize = win.onResized(handleResize);

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      unlistenMove.then((fn) => fn());
      unlistenResize.then((fn) => fn());
    };
  }, [isLoading, updateSettings]);

  return (
    <>
      <TitleBar />
      <Clock />
    </>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
