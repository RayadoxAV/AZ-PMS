import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';

Menu.setApplicationMenu(null);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'undocked', activate: false });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
