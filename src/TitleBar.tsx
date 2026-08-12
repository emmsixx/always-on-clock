import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import React, { useState, useEffect, useRef } from "react";
import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from '@tauri-apps/api/menu';
import { Clock1, PinIcon, Settings as SettingsIcon } from "lucide-react";

let settingsWindowPromise: Promise<void> | null = null;
const SETTINGS_WINDOW_WIDTH = 760;
const SETTINGS_WINDOW_HEIGHT = 560;

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
    minWidth: 620,
    minHeight: 480,
    x,
    y,
    preventOverflow: true,
    resizable: true,
    decorations: false,
    transparent: false,
    // Matches --bg-chrome, so the window paints its own surface instead of flashing white.
    backgroundColor: [11, 12, 14, 255],
  });

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let unlistenCreated: (() => void) | undefined;
    let unlistenError: (() => void) | undefined;
    let timeoutId: number | undefined;

    const cleanup = () => {
      unlistenCreated?.();
      unlistenError?.();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };

    const settle = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };
    const fail = (error: unknown) => settle(() => reject(error));
    timeoutId = window.setTimeout(
      () => fail(new Error('Timed out waiting for the settings window to be created')),
      10_000,
    );

    void webview
      .once('tauri://created', () => settle(resolve))
      .then((unlisten) => {
        unlistenCreated = unlisten;
        if (settled) unlisten();
      })
      .catch(fail);
    void webview
      .once('tauri://error', (event) => settle(() => reject(event.payload)))
      .then((unlisten) => {
        unlistenError = unlisten;
        if (settled) unlisten();
      })
      .catch(fail);
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
    const previousValue = onTop ?? false;
    const currentWindow = getCurrentWindow();

    try {
      if (!trayRef.current) {
        await createMenu();
      }

      await currentWindow.setAlwaysOnTop(value);
      await currentWindow.setResizable(!value);
      await trayRef.current?.setVisible(value);
      await currentWindow.setIgnoreCursorEvents(value);
      setOnTop(value);
    } catch (error) {
      console.error('Failed to change the always-on-top state:', error);

      try {
        await currentWindow.setAlwaysOnTop(previousValue);
        await currentWindow.setResizable(!previousValue);
        await trayRef.current?.setVisible(previousValue);
        await currentWindow.setIgnoreCursorEvents(previousValue);
      } catch (rollbackError) {
        console.error('Failed to restore the previous window state:', rollbackError);
      }

      setOnTop(previousValue);
    }
  };

  if (onTop === null || onTop) return null;

  return (
    <div className="chrome" data-tauri-drag-region>
      <span className="chrome-grip" data-tauri-drag-region aria-hidden="true">
        <Clock1 size={14} strokeWidth={2.2} />
        <span className="chrome-name">Always On Clock</span>
      </span>
      <span className="chrome-actions">
        <button
          type="button"
          className="chrome-button"
          onClick={() => void openSettingsWindow()}
          aria-label="Open settings"
          title="Settings"
        >
          <SettingsIcon size={15} strokeWidth={2.1} />
        </button>
        <button
          type="button"
          className="chrome-button chrome-button--pin"
          onClick={() => void setTop(true)}
          aria-label="Pin above all windows"
          title="Pin above all windows — the clock becomes click-through"
        >
          <PinIcon size={15} strokeWidth={2.1} />
        </button>
      </span>
    </div>
  );
};

export default TitleBar;
