const { BrowserWindow } = require("electron")

module.exports = function windowEventsManager(_, args) {
  switch (args) {
    case 'minimize': {
      BrowserWindow.getAllWindows()[0].minimize();
      break;
    };

    case 'maximize': {
      const window = BrowserWindow.getAllWindows()[0];

      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }

      break;
    }

    case 'close': {
      BrowserWindow.getAllWindows()[0].close();
      break;
    }

    default: {
      console.log(`Unknown command ${args}`);
      break;
    }
  }
}