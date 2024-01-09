/* 
  Author: Raymundo Paz
  Date: 12/29/2023
*/
require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const Logger = require('./util/Logger');
const DataExtractor = require('./data/dataExtractor');
const WorkbookProvider = require('./data/workbookProvider');
const dataManager = require('./data/dataManager');

if (process.env.CURR_ENV === 'dev') {
  Logger.Log('Initializing in debug mode', 0 /* Info */)

  const path = require('path');

  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../', 'node_modules', '.bin', 'electron')
  });


}

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 700,
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
  Logger.Log('Window created successfully', 1);

  // loadProject();



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

function loadProject() {

  // dataManager.loadProject({ path: '', projectId: 'something' })

  let path = '';
  let projectId = '';

  if (process.argv[1] === '.') {
    path = process.argv[2];
    projectId = process.argv[3];
  } else {
    path = process.argv[1];
    projectId = process.argv[2];
  }

  if (!path || !projectId) {
    Logger.Log('Not enough arguments specified', 3);
    return;
  }

  dataManager.loadProject({ path, projectId });
}
