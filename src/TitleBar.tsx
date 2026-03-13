import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import React, { useState, useEffect, useRef } from "react";
import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from '@tauri-apps/api/menu';
import { Clock1, PinIcon, Settings as SettingsIcon } from "lucide-react";

async function openSettingsWindow() {
  const existing = await WebviewWindow.getByLabel('settings');
  if (existing) {
    await existing.setFocus();
    return;
  }

  const mainWin = getCurrentWindow();
  const pos = await mainWin.innerPosition();
  const size = await mainWin.innerSize();

  const webview = new WebviewWindow('settings', {
    url: '/',
    title: 'Settings',
    width: 420,
    height: 660,
    x: pos.x + size.width + 16,
    y: pos.y,
    resizable: false,
    decorations: false,
    transparent: false,
  });

  webview.once('tauri://error', (e) => {
    console.error('Failed to create settings window:', e);
  });
}

const TitleBar: React.FC = () => {
  const [onTop, setOnTop] = useState<boolean | null>(null);
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
          action: async () => {
            await setTop(false);
            await openSettingsWindow();
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
          className="w-full cursor-move flex flex-row justify-between items-center text-white px-4 py-3 text-lg bg-[#0c0d0f] transition-all"
        >
          <div className="flex flex-row items-center space-x-2.5 pointer-events-none">
            <Clock1 className="w-5 h-5" />
            <span className="text-sm font-medium">Clock</span>
          </div>
          <div className="flex flex-row items-center space-x-1.5">
            <button
              className="p-2 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
              onClick={() => openSettingsWindow()}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
              onClick={() => setTop(true)}
              title="Pin window (always on top)"
            >
              <PinIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TitleBar;
