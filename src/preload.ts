/* 
  Raymundo Paz
  March 2024
*/

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowBridge', {
  applyEvent: (window: string, event: string) => ipcRenderer.send('window-events', { window: window, event: event })
});

contextBridge.exposeInMainWorld('backendBridge', {
  onErrorReceived: (callback: any) => ipcRenderer.on('error', (_event, value) => callback(value))
});
