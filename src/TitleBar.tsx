import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import React, { useState, useEffect, useRef } from "react";
import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from '@tauri-apps/api/menu';
import { Clock1, PinIcon, Settings as SettingsIcon } from "lucide-react";

let settingsWindowPromise: Promise<void> | null = null;
const SETTINGS_WINDOW_WIDTH = 420;
const SETTINGS_WINDOW_HEIGHT = 700;

async function createSettingsWindow() {
  const existing = await WebviewWindow.getByLabel('settings');
  if (existing) {
    await existing.show();
    await existing.setFocus();
    return;
  }

  const mainWin = getCurrentWindow();
  const [pos, size, monitor] = await Promise.all([
    mainWin.innerPosition(),
    mainWin.innerSize(),
    currentMonitor(),
  ]);
  const scaleFactor = monitor?.scaleFactor ?? await mainWin.scaleFactor();
  const logicalPos = pos.toLogical(scaleFactor);
  const logicalSize = size.toLogical(scaleFactor);
  const workArea = monitor?.workArea;

  let x = logicalPos.x + logicalSize.width + 16;
  let y = logicalPos.y;

  if (workArea) {
    const workAreaPos = workArea.position.toLogical(scaleFactor);
    const workAreaSize = workArea.size.toLogical(scaleFactor);
    const maxX = workAreaPos.x + Math.max(0, workAreaSize.width - SETTINGS_WINDOW_WIDTH);
    const maxY = workAreaPos.y + Math.max(0, workAreaSize.height - SETTINGS_WINDOW_HEIGHT);
    const leftX = logicalPos.x - SETTINGS_WINDOW_WIDTH - 16;
    const rightFits = x >= workAreaPos.x && x <= maxX;
    const leftFits = leftX >= workAreaPos.x && leftX <= maxX;
    x = rightFits ? x : leftFits ? leftX : Math.min(Math.max(x, workAreaPos.x), maxX);
    y = Math.min(Math.max(y, workAreaPos.y), maxY);
  }

  const webview = new WebviewWindow('settings', {
    url: '/',
    title: 'Settings',
    width: SETTINGS_WINDOW_WIDTH,
    height: SETTINGS_WINDOW_HEIGHT,
    x,
    y,
    preventOverflow: true,
    resizable: false,
    decorations: false,
    transparent: false,
  });

  await new Promise<void>((resolve, reject) => {
    void webview.once('tauri://created', () => resolve()).catch(reject);
    void webview.once('tauri://error', (event) => reject(event.payload)).catch(reject);
  });
}

async function openSettingsWindow() {
  if (!settingsWindowPromise) {
    settingsWindowPromise = createSettingsWindow();
  }

  try {
    await settingsWindowPromise;
  } catch (error) {
    console.error('Failed to open settings window:', error);
  } finally {
    settingsWindowPromise = null;
  }
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
            const mainWindow = getCurrentWindow();

            try {
              const settingsWindow = await WebviewWindow.getByLabel('settings');
              await settingsWindow?.close();
            } catch (error) {
              console.error('Failed to close settings window:', error);
            } finally {
              await mainWindow.close();
            }
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
          className="w-full cursor-move flex flex-row justify-between items-center text-white text-lg bg-[#0c0d0f] transition-all"
          style={{ padding: '14px 28px' }}
        >
          <div className="flex flex-row items-center space-x-2.5 pointer-events-none">
            <Clock1 className="w-5 h-5" />
            <span className="text-sm font-medium">Clock</span>
          </div>
          <div className="flex flex-row items-center space-x-1.5">
            <button
              className="p-2 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
              onClick={() => void openSettingsWindow()}
              aria-label="Open settings"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
              onClick={() => void setTop(true)}
              aria-label="Pin window"
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
