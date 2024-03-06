/* 
  Raymundo Paz
  March 2024
*/

import { BrowserWindow, app } from 'electron';

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

      default: {
        break;
      }
    }
  }

}
