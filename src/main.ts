/* 
  Raymundo Paz
  March 2024
*/

import 'dotenv/config';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { manageEvents } from './ui/events/ipcEvents';
import { GlobalSharedObject } from './util/misc';
import { ArgumentsManager } from './util/argsManager';
import { DataCollector } from './data/processing/dataCollector';
import { CustomWorkbook } from './data/data';
import { DataExtractor } from './data/processing/dataExtractor';
import { DataTransformator } from './data/processing/dataTransformator';

declare global {
  var shared: GlobalSharedObject;
}

global.shared = {
  args: ArgumentsManager.parseArguments()
};

Menu.setApplicationMenu(null);

// NOTE: Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
 
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 480,
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

  // TODO: Remove this
  const result = new DataCollector().provideWorkbook();

  const dataExtractor = new DataExtractor();
  result.then((workbook: CustomWorkbook) => {
    const resultIndex = dataExtractor.evaluateSheets(workbook, 'PR-7');
    if (resultIndex !== -1) {
      new DataTransformator().sheetToWorkplan(workbook.sheets[resultIndex]);
    }


  });

manageEvents();

