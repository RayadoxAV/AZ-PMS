const { ipcMain } = require('electron');
const windowEventsManager = require('./windowEventsManager');
const dataManager = require('../data/dataManager');


ipcMain.on('window-events', windowEventsManager);
ipcMain.on('data-events', dataManager.manageDataEvents);
