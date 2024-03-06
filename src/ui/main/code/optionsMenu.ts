/* 
  Raymundo Paz
  March 2024
*/

export const optionsMenuHTML = 
`
  <button class="option-item" style="--index: 1">
    <i class="icon" data-icon="reload"></i>
    <span class="tooltip">Rerun</span>
  </button>
  <button class="option-item" style="--index: 2">
    <i class="icon" data-icon="zoom-in"></i>
    <span class="tooltip">Zoom in</span>
  </button>
  <button class="option-item" style="--index: 3">
    <i class="icon" data-icon="zoom-out"></i>
    <span class="tooltip">Zoom out</span>
  </button>
  <button class="option-item" style="--index: 4">
    <i class="icon" data-icon="zoom-reset"></i>
    <span class="tooltip">Reset zoom</span>
  </button>
  <button class="option-item" style="--index: 5">
    <i class="icon" data-icon="collapse"></i>
    <span class="tooltip">Collapse</span>
  </button>
  <button class="option-item" style="--index: 6">
    <i class="icon" data-icon="expand"></i>
    <span class="tooltip">Expand</span>
  </button>
`;

export function handleOptionsMenu(visible: boolean): void {
  if (window.internalState.optionsMenuVisible) {
    if (visible) {
      removeOptionsMenu();
      showOptionsMenu();
    } else {
      removeOptionsMenu();
    }
  } else {
    if (visible) {
      showOptionsMenu();
    }
  }
}

function removeOptionsMenu(): void {
  document.getElementById('opts-menu-container').remove();
}

function showOptionsMenu(): void {
  const { x, y, width: fabWidth } = document.getElementById('fab-options').getBoundingClientRect();

  const optionsMenuElement = document.createElement('div');
  optionsMenuElement.classList.add('opts-menu-container');
  optionsMenuElement.id = 'opts-menu-container';
  optionsMenuElement.tabIndex = 0;

  optionsMenuElement.innerHTML = optionsMenuHTML;
  // optionsMenuElement.style.top = `${y}px`;

  document.querySelector('body').appendChild(optionsMenuElement);

  const { height, width } = optionsMenuElement.getBoundingClientRect();
  optionsMenuElement.style.left =`${x + (fabWidth / 2) - (width / 2) }px`;
  optionsMenuElement.style.top = `${y - height - 8}px`;
}
