/* 
  Author: Raymundo Paz
  Date: 12/29/2023
*/
require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const global = require('./util/global');
const Logger = require('./util/Logger');
const { ArgumentParser } = require('./util/argumentParser');

if (process.env.CURR_ENV === 'dev') {
  Logger.Log('Initializing in debug mode', 0 /* Info */)

  const path = require('path');

  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../', 'node_modules', '.bin', 'electron')
  });
}

global.shared.args = ArgumentParser.getArguments();

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 750,
    minHeight: 700,
    frame: false,
    title: 'Summary for [project]',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  window.loadFile('./src/ui/index.html');
  window.maximize();
}

app.whenReady().then(() => {
  createWindow();
  Logger.Log('Window created successfully', 1);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

require('./events/ipcEvents');