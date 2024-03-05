import { handleContextMenu } from './contextMenu';
import { initNavigationMenu, selectContainer } from './navMenu';
import { initTitlebar } from './titlebar';
import { InternalState } from './types';

declare global {
  var electronAPI: any;
  var internalState: InternalState;
};

function initializeInternalState(): void {
  const temp = {
    contextMenuVisible: false,
    contextMenuCoords: { x: 0, y: 0 }
  };


  const internalStateProxy = new Proxy(temp, {
    set: function (target: any, key, value) {

      if (key === 'contextMenuVisible') {
        handleContextMenu(value);
      }

      target[key] = value;

      return true;
    }
  });

  window.internalState = internalStateProxy;

}

function listenGlobalEvents(): void {
  window.addEventListener('contextmenu', (event) => {
    const { clientX, clientY } = event;
    window.internalState.contextMenuCoords = { x: clientX, y: clientY };
    window.internalState.contextMenuVisible = true;
  });

  window.addEventListener('click', (event) => {
    const matchesContextMenu = ((event.target as HTMLElement).matches('div.context-menu') || (event.target as HTMLElement).matches('div.context-menu > *'));
    if (!matchesContextMenu) {
      window.internalState.contextMenuVisible = false;
    }
  });

  window.addEventListener('blur', (event) => {
    window.internalState.contextMenuVisible = false;
  });
}


function main(): void {
  initializeInternalState();
  listenGlobalEvents();

  initTitlebar();

  initNavigationMenu();
  selectContainer(1);
}

main();

