/* 
  Raymundo Paz
  March 2024
*/

import { ipcMain } from 'electron';
import { manageWindowEvents } from './windowEventsManager';
import { manageKeyboardEvents } from './keyboardEventsManager';

export function manageEvents() {
  ipcMain.on('window-events', manageWindowEvents);
  ipcMain.on('window-keyboard-events', manageKeyboardEvents);
}
