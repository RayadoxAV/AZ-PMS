/* 
  Raymundo Paz
  March 2024
*/

import { initBlockerUI } from './blockerUI';
import { handleContextMenu } from './contextMenu';
import { initNavigationMenu, selectContainer } from './navMenu';
import { handleOptionsMenu } from './optionsMenu';
import { initTitlebar } from './titlebar';
import { InternalState } from './types';

declare global {
  var electronAPI: any;
  var internalState: InternalState;
};

function initializeInternalState(): void {
  const temp: InternalState = {
    contextMenuVisible: false,
    contextMenuCoords: { x: 0, y: 0 },
    optionsMenuVisible: false
  };


  const internalStateProxy = new Proxy(temp, {
    set: function (target: any, key, value) {

      if (key === 'contextMenuVisible') {
        handleContextMenu(value);
      }

      if (key === 'optionsMenuVisible') {
        handleOptionsMenu(value);
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

    const matchesOptionsMenu = ((event.target as HTMLElement).matches('div.opts-menu-container') || (event.target as HTMLElement).matches('div.opts-menu-container > *') || (event.target as HTMLElement).matches('button.fab-options')) ;

    if (!matchesOptionsMenu) {
      window.internalState.optionsMenuVisible = false;
    }

  });

  window.addEventListener('blur', (event) => {
    window.internalState.contextMenuVisible = false;
    window.internalState.optionsMenuVisible = false;
  });
}

function main(): void {
  initializeInternalState();
  listenGlobalEvents();

  initTitlebar();

  initNavigationMenu();
  selectContainer(1);

  initBlockerUI();
}

main();

