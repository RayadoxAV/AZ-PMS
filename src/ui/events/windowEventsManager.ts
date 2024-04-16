/* 
  Raymundo Paz
  March 2024
*/

import { BrowserWindow, app } from 'electron';
import path from 'path';

export function manageWindowEvents(_: any, ...args: any[]): void {
  const { window: windowName, event } = args[0];

  const windows = BrowserWindow.getAllWindows();

  let actualWindow: BrowserWindow = undefined;

  for (let i = 0; i < windows.length; i++) {
    const currentWindow = windows[i];

    if (windowName === currentWindow.title) {
      actualWindow = currentWindow;
      break;
    }
  }

  if (actualWindow) {
    switch (event) {
      case 'minimize': {
        actualWindow.minimize();
        break;
      }

      case 'maximize': {
        if (actualWindow.isMaximized()) {
          actualWindow.unmaximize();
        } else {
          actualWindow.maximize();
        }
        break;
      }

      case 'close': {
        if (windowName === 'Main') {
          app.quit();
        } else {
          actualWindow.close();
        }
        break;
      }

      case 'open-window': {
        const { targetWindow } = args[0].args;

        if (targetWindow === 'Settings') {
          const settingsWindow = new BrowserWindow(
            {
              width: 1280,
              height: 720,
              minWidth: 800,
              minHeight: 600,
              frame: false,
              title: 'AZ-PMS - Settings',
              webPreferences: {
                preload: path.join(__dirname, 'preload.js')
              }
            }
          );
          settingsWindow.webContents.openDevTools();

          if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
            settingsWindow.loadURL(SETTINGS_WINDOW_VITE_DEV_SERVER_URL);
          } else {
            settingsWindow.loadFile(path.join(__dirname, `../ui/settigns/${SETTINGS_WINDOW_VITE_NAME}/index.html`))
          }

        } else if (targetWindow === 'Help') {
          const helpWindow = new BrowserWindow(
            {
              width: 1280,
              height: 720,
              minWidth: 800,
              minHeight: 600,
              frame: false,
              title: 'AZ-PMS - Help',
              webPreferences: {
                preload: path.join(__dirname, 'preload.js')
              }
            }
          );

          helpWindow.webContents.openDevTools();

          if (HELP_WINDOW_VITE_DEV_SERVER_URL) {
            helpWindow.loadURL(HELP_WINDOW_VITE_DEV_SERVER_URL);
          } else {
            helpWindow.loadFile(path.join(__dirname, `../ui/help_window/${HELP_WINDOW_VITE_NAME}/index.html`))
          }

        } else {
          // TODO: Error. Unknown window
        }
        break;
      }

      default: {
        break;
      }
    }
  }

}
