/* 
  Raymundo Paz
  March 2024
*/

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { manageEvents } from './ui/events/ipcEvents';

Menu.setApplicationMenu(null);

// NOTE: Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
 
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    title: 'AZ-PMS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../ui/main_window/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
/* 
  const settingsWindow = new BrowserWindow({
    width: 700,
    height: 300
  });

  if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(SETTINGS_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    settingsWindow.loadFile(path.join(__dirname, `../ui/settings_window/${SETTINGS_WINDOW_VITE_NAME}/index.html`));
  }

  const helpWindow = new BrowserWindow({
    width: 400,
    height: 600
  });

  if (HELP_WINDOW_VITE_DEV_SERVER_URL) {
    helpWindow.loadURL(HELP_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    helpWindow.loadFile(path.join(__dirname, `../ui/help_window/${HELP_WINDOW_VITE_NAME}/index.html`));
  }
 */

  mainWindow.webContents.openDevTools({ mode: 'right'});
  mainWindow.maximize();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

manageEvents();
