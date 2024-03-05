export const contextMenuHTML =
  `
  <div class="menu-item">
    <span class="text">Reload window</span>
    <span class="shortcut">Ctrl+R</span>
  </div>
  <div class="menu-item">
    <span class="text">Option</span>
  </div>
  <div class="divider"></div>
  <div class="menu-item">
    <span class="text">Option</span>
  </div>
  <div class="menu-item">
    <span class="text">Option</span>
  </div>
  <div class="menu-item">
    <span class="text">Option</span>
  </div>
`;

export function handleContextMenu(visible: boolean) {

  if (window.internalState.contextMenuVisible) {
    if (visible) {
      removeContextMenu();
      showContextMenu();
    } else {
      removeContextMenu();
    }
  } else {
    if (visible) {
      showContextMenu();
    }
  }
}

function removeContextMenu(): void {
  document.getElementById('context-menu').remove();
}

function showContextMenu(): void {

  const { x, y } = window.internalState.contextMenuCoords;

  const contextMenuElement = document.createElement('div');
  contextMenuElement.classList.add('context-menu');
  contextMenuElement.id = 'context-menu';

  contextMenuElement.innerHTML = contextMenuHTML;

  contextMenuElement.style.left = `${x + 16}px`;
  contextMenuElement.style.top = `${y}px`;

  document.querySelector('body').appendChild(contextMenuElement);
  
  const { width, height, left, top } = contextMenuElement.getBoundingClientRect();

  if ((left + width + 16) > window.innerWidth) {
    contextMenuElement.style.left = 'unset';
    contextMenuElement.style.right = `${(window.innerWidth - x) + 8}px`;
  }

  if ((top + 2 * height) > window.innerHeight) {
    contextMenuElement.style.top = 'unset';
    contextMenuElement.style.bottom = `${(window.innerHeight - y) + 8}px`;
  }
}
