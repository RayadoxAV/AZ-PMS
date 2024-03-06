/* 
  Raymundo Paz
  March 2024
*/

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  applyEvent: (window: string, event: string) => ipcRenderer.send('window-events', { window: window, event: event })
});
