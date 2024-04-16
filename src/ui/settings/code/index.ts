/* 
  Raymundo Paz
  April 2024
*/

import { initNavigationMenu, selectContainer } from './navMenu';
import { initTitlebar } from './titlebar';
import { CustomKeyboardEvent } from './util/types';

function main(): void {
  registerEvents();

  initTitlebar();
  initNavigationMenu();
  selectContainer(0);

}

function registerEvents() {


  window.addEventListener('keydown', (event: KeyboardEvent): void => {

    if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Tab') {
      return;
    }

    const customEvent: CustomKeyboardEvent = {
      key: event.key.toLocaleLowerCase(),
      modifiers: {
        ctrl: event.ctrlKey
      }
    };
    window.windowBridge.registerKeyboardEvent('Settings', customEvent, 'args');
  });
}

main();
