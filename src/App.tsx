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
    let moveTimeout: number | null = null;
    let resizeTimeout: number | null = null;

    const handleMove = async () => {
      if (moveTimeout) clearTimeout(moveTimeout);
      moveTimeout = window.setTimeout(async () => {
        const pos = await win.innerPosition();
        void updateSettings({ windowPosition: { x: pos.x, y: pos.y } }).catch(() => undefined);
      }, 500);
    };

    const handleResize = async () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(async () => {
        const size = await win.innerSize();
        void updateSettings({
          windowSize: { width: size.width, height: size.height },
        }).catch(() => undefined);
      }, 500);
    };

    const unlistenMove = win.onMoved(handleMove);
    const unlistenResize = win.onResized(handleResize);

    return () => {
      if (moveTimeout) clearTimeout(moveTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      unlistenMove.then((fn) => fn());
      unlistenResize.then((fn) => fn());
    };
  }, [isLoading, updateSettings]);

  // The shell hugs its content so the chrome chip lines up with the clock's own edges rather
  // than stretching across a transparent window.
  return (
    <div className="overlay-shell">
      <TitleBar />
      <Clock />
    </div>
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
