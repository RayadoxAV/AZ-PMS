const { ipcMain } = require('electron');
const windowEventsManager = require('./windowEventsManager');

ipcMain.on('window-events', windowEventsManager);
