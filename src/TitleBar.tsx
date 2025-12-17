import { getCurrentWindow } from "@tauri-apps/api/window";
import React, { useState, useEffect, useRef } from "react";
import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from '@tauri-apps/api/menu';
import { Clock1, PinIcon, Settings as SettingsIcon } from "lucide-react";
import Settings from "./components/Settings";

interface TitleBarProps {
  onSettingsOpen?: () => void;
}

const TitleBar: React.FC<TitleBarProps> = () => {
  const [onTop, setOnTop] = useState<boolean | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const trayRef = useRef<TrayIcon | null>(null);

  useEffect(() => {
    const checkOnTop = async () => {
      const currentWindow = getCurrentWindow();
      const isOnTop = await currentWindow.isAlwaysOnTop();
      setOnTop(isOnTop);
    };
    checkOnTop();
  }, []);

  const createMenu = async () => {
    const menu = await Menu.new({
      items: [
        {
          id: 'show',
          text: 'Show Window',
          action: async () => {
            const win = getCurrentWindow();
            await win.show();
            await win.setFocus();
          },
        },
        {
          id: 'settings',
          text: 'Settings',
          action: () => {
            setTop(false).then(() => setSettingsOpen(true));
          },
        },
        {
          id: 'unpin',
          text: 'Unpin',
          action: () => {
            setTop(false);
          },
        },
        {
          id: 'quit',
          text: 'Quit',
          action: async () => {
            const win = getCurrentWindow();
            await win.close();
          },
        },
      ],
    });

    const icon = await defaultWindowIcon();

    const options = icon
      ? { icon, menu, menuOnLeftClick: true }
      : { menu, menuOnLeftClick: true };

    trayRef.current = await TrayIcon.new(options);
  };

  const setTop = async (value: boolean) => {
    if (!trayRef.current) {
      await createMenu();
    }

    setOnTop(value);
    const currentWindow = getCurrentWindow();
    await currentWindow.setAlwaysOnTop(value);
    await currentWindow.setResizable(!value);
    await trayRef.current?.setVisible(value);
    await currentWindow.setIgnoreCursorEvents(value);
  };

  return (
    <>
      {onTop === null ? (
        <div className="p-2 text-gray-400">Loading...</div>
      ) : onTop ? null : (
        <div
          data-tauri-drag-region
          className="w-full cursor-move flex flex-row justify-between items-center text-white px-3 py-2 text-lg bg-[#0c0d0f] transition-all"
        >
          <div className="flex flex-row items-center space-x-2 pointer-events-none">
            <Clock1 className="w-5 h-5" />
            <span className="text-sm font-medium">Clock</span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <button
              className="p-1.5 hover:bg-gray-700 rounded transition-colors cursor-pointer"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-gray-700 rounded transition-colors cursor-pointer"
              onClick={() => setTop(true)}
              title="Pin window (always on top)"
            >
              <PinIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default TitleBar;
