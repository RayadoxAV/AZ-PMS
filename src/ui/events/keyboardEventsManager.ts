/* 
  Raymundo Paz
  April 2024
*/

import { BrowserWindow, app } from 'electron';
import { CustomKeyboardEvent } from '../../util/util';
import { LogType, Logger } from '../../util/logger';

export function manageKeyboardEvents(_: unknown, args: { window: string, event: CustomKeyboardEvent }): void {
  
  if (args.event.modifiers.ctrl) {
    handleCtrlShortcuts(args.event, args.window);
  }
}

function handleCtrlShortcuts(event: CustomKeyboardEvent, windowName: string): void {
  const windows = BrowserWindow.getAllWindows();

  let actualWindow: BrowserWindow = undefined;

  for (let i = 0; i < windows.length; i++) {
    const currentWindow = windows[i];
    if (windowName === currentWindow.title) {
      actualWindow = currentWindow;
      break;
    }
  }

  if (!actualWindow) {
    Logger.log(`Unknown window: '${windowName}'`, LogType.WARNING);
    return;
  }

  switch (event.key) {
    case 'r':
      actualWindow.reload();
      break;

    case 'w':
      if (windowName === 'Main') {
        app.quit();
      } else {
        actualWindow.close();
      }
      break;

    default:
      // Do nothing :)
      break;
  }
}
