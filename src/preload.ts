/* 
  Raymundo Paz
  March 2024
*/

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowBridge', {
  applyEvent: (window: string, event: string, args: any) => ipcRenderer.send('window-events', { window: window, event: event, args: args }),
  registerKeyboardEvent: (window: string, event: object, args: any) => ipcRenderer.send('window-keyboard-events', { window: window, event: event, args: args })
});

contextBridge.exposeInMainWorld('backendBridge', {
  onErrorReceived: (callback: any) => ipcRenderer.on('error', (_event, value) => callback(value))
});
