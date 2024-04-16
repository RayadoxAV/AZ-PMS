/* 
  Raymundo Paz
  April 2024
*/

export function initTitlebar(): void {
  const minimizeButton = document.getElementById('titlebar-minimize-button');
  const maximizeButton = document.getElementById('titlebar-maximize-button');
  const closeButton = document.getElementById('titlebar-close-button');

  minimizeButton.addEventListener('click', () => {
    window.windowBridge.applyEvent('Settings', 'minimize');
  });

  maximizeButton.addEventListener('click', () => {
    window.windowBridge.applyEvent('Settings', 'maximize');
  });

  closeButton.addEventListener('click', () => {
    window.windowBridge.applyEvent('Settings', 'close');
  });
}
