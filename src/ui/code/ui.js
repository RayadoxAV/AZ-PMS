const { ipcRenderer, webFrame } = require('electron');

const fabMenu = document.getElementById('fab-menu');
const menuContainer = document.getElementById('menu-container');

const reloadButton = document.getElementById('reload-button');
const zoomInButton = document.getElementById('zoom-in-button');
const zoomOutButton = document.getElementById('zoom-out-button');
const zoomResetButton = document.getElementById('zoom-reset-button');
const settingsButton = document.getElementById('settings-button');
const helpButton = document.getElementById('help-button');

function init() {


  const fabRect = fabMenu.getBoundingClientRect();
  
  menuContainer.style.top = `${fabRect.top + fabRect.height + 16}px`;
  menuContainer.style.left = `${fabRect.left + (fabRect.width / 2 ) - 16}px`;


  fabMenu.addEventListener('click', () => {
    const visibile = menuContainer.style.display === 'flex' ? true : false;

    if (visibile) {
      menuContainer.classList.add('close-menu');
      setTimeout(() => {
        menuContainer.style.display = 'none';
      }, 150);
    } else {
      menuContainer.classList.remove('close-menu');
      menuContainer.style.display = 'flex';
    }
  });

  reloadButton.addEventListener('click', () => {
    ipcRenderer.send('data-events', { name: 'load-project' });
  });

  zoomInButton.addEventListener('click', () => {
    const zoomLevel = webFrame.getZoomLevel();

    if (zoomLevel + 1 < 5) {
      webFrame.setZoomLevel(zoomLevel + 1);      
    }
  });

  zoomOutButton.addEventListener('click', () => {
    const zoomLevel = webFrame.getZoomLevel();

    if (zoomLevel - 1 > -4) {
      webFrame.setZoomLevel(zoomLevel - 1);
    }
  });

  zoomResetButton.addEventListener('click', () => {
    webFrame.setZoomLevel(0);
  });
  
  settingsButton.addEventListener('click', () => {
    // alert('open new window');
    ipcRenderer.send('window-events', { name: 'open-settings-window', window: 'Settings' });

  });

  helpButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'open-help-window', window: 'Help' });

    // const helpWindow = window.open('', '_blank', 'frame=false');
  });
}

init();

