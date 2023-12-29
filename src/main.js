/* 
  Author: Raymundo Paz
  Date: 12/29/2023
*/
require('dotenv').config();

const { app, BrowserWindow } = require('electron');
const Logger = require('./util/Logger');

if (process.env.CURR_ENV === 'dev') {
  Logger.Log('INFO: Initializing in debug mode', 0 /* Info */)

  const path = require('path');

  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../', 'node_modules', '.bin', 'electron')
  });


}

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    title: 'Summary for [project]',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  // window.maximize();
  window.loadFile('./src/ui/index.html');

}

app.whenReady().then(() => {
  createWindow();

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
