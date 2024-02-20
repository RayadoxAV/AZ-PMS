const { ipcRenderer } = require('electron');

let selectedCategoryIndex = -1;

function handleWindowControls() {
  const minimizeButton = document.getElementById('titlebar-minimize-button');
  const maximizeButton = document.getElementById('titlebar-maximize-button');
  const closeButton = document.getElementById('titlebar-close-button');

  minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'minimize', window: 'Help' });
  });

  maximizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'maximize', window: 'Help' });
  });

  closeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'close', window: 'Help' });
  });
}

handleWindowControls();
