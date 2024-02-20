const { app, BrowserWindow } = require("electron")

module.exports = function windowEventsManager(_, args) {
  switch (args.name) {
    case 'minimize': {
      // BrowserWindow.getAllWindows()[0].minimize();
      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          window.minimize();
        }
      }
      break;
    };

    case 'maximize': {
      // const window = BrowserWindow.getAllWindows()[0];

      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          if (window.isMaximized()) {
            window.unmaximize();
          } else {
            window.maximize();
          }
        }
      }


      break;
    }

    case 'close': {
      // BrowserWindow.getAllWindows()[0].close();

      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          if (args.window === 'Main') {
            app.quit();
          } else {
            window.close();
          }
        }
      }

      break;
    }

    case 'open-settings-window': {
      let settingsWindowFound = false;

      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          window.focus();
          settingsWindowFound = true;

          break;
        }
      }

      if (!settingsWindowFound) {
        const settingsWindow = new BrowserWindow({
          width: 1280,
          height: 720,
          frame: false,
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
          }
        });
        settingsWindow.loadFile('./src/ui/settings/settings.html');
      }
      break;
    }

    case 'open-help-window': {
      let helpWindowFound = false;

      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          window.focus();
          helpWindowFound = true;
          break;
        }
      }

      if (!helpWindowFound) {
        const helpWindow = new BrowserWindow({
          width: 800,
          height: 600,
          frame: false,
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
          }
        });
        helpWindow.loadFile('./src/ui/help/help.html')
        // const helpWindow = new BrowserWindow({
        //   width: 800,
        //   height: 600,
        //   titleBarStyle: 'hidden',
        //   titleBarOverlay: {
        //     color: '#2f3241',
        //     symbolColor: '#74b1be',
        //     height: 60
        //   },
        //   // frame: false,
        //   title: 'Help',
        //   // transparent: true,
        //   webPreferences: {
        //     contextIsolation: false,
        //     nodeIntegration: true
        //   }
        // });
        // helpWindow.loadFile('./src/ui/help/help.html');
      }

      break;
    }

    default: {
      console.log(`Unknown command ${args}`);
      break;
    }
  }
}