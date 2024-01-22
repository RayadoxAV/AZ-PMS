const { ipcRenderer } = require("electron");

const minimizeButton = document.getElementById('titlebar-minimize-button');
const maximizeButton = document.getElementById('titlebar-maximize-button');
const closeButton = document.getElementById('titlebar-close-button');

function init() {
  minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'minimize', window: 'Main' });
  });

  maximizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'maximize', window: 'Main' });
  });

  closeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'close', window: 'Main'});
  });
}

init();
