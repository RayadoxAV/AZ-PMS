
export function initTitlebar() {
  const minimizeButton = document.getElementById('titlebar-minimize-button');
  const maximizeButton = document.getElementById('titlebar-maximize-button');
  const closeButton = document.getElementById('titlebar-close-button');

  minimizeButton.addEventListener('click', () => {
    window.electronAPI.applyEvent('Main', 'minimize');
  });

  maximizeButton.addEventListener('click', () => {
    window.electronAPI.applyEvent('Main', 'maximize');
  });

  closeButton.addEventListener('click', () => {
    window.electronAPI.applyEvent('Main', 'close');
  });
}
