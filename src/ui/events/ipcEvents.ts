/* 
  Raymundo Paz
  March 2024
*/

import { ipcMain } from 'electron';
import { manageWindowEvents } from './windowEventsManager';

export function manageEvents() {
  ipcMain.on('window-events', manageWindowEvents);
}
