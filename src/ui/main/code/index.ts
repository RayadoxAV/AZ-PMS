/* 
  Raymundo Paz
  March 2024
*/

import CustomComponent from './components/CustomComponents';
import AZNavRail from './components/nav-rail/NavRail';
import AZNavRailItem from './components/nav-rail/NavRailItem';
import AZTitleBar from './components/title-bar/AZTitleBar';

// NOTE: Welcome to my next extra miler, or my downfall
async function main(): Promise<void> {
  console.log('Hello World!');
  registerComponents([AZTitleBar, AZNavRail, AZNavRailItem]);
}

function registerComponents(components: any[]): void {
  for (let i = 0; i < components.length; i++) {
    const component = components[i];

    if (component.prototype instanceof HTMLElement) {
      customElements.define(component.templateName, component);
    } else if (component.prototype instanceof CustomComponent) {
      new component().init();
    } else {
      console.log('Not supported class');
    }
  }
}

main();

// declare global {
//   var windowBridge: any;
//   var backendBridge: any;
//   var internalState: InternalState;
// };

// function initializeInternalState(): void {
//   const temp: InternalState = {
//     contextMenuVisible: false,
//     contextMenuCoords: { x: 0, y: 0 },
//     optionsMenuVisible: false
//   };


//   const internalStateProxy = new Proxy(temp, {
//     set: function (target: any, key, value) {

//       if (key === 'contextMenuVisible') {
//         handleContextMenu(value);
//       }

//       if (key === 'optionsMenuVisible') {
//         handleOptionsMenu(value);
//       }

//       target[key] = value;

//       return true;
//     }
//   });

//   window.internalState = internalStateProxy;

// }

// function listenGlobalEvents(): void {
//   window.addEventListener('contextmenu', (event) => {
//     const { clientX, clientY } = event;
//     window.internalState.contextMenuCoords = { x: clientX, y: clientY };
//     window.internalState.contextMenuVisible = true;
//   });

//   window.addEventListener('click', (event) => {
//     /* TODO: Handle in other file */
//     const matchesContextMenu = ((event.target as HTMLElement).matches('div.context-menu') || (event.target as HTMLElement).matches('div.context-menu > *'));
//     if (!matchesContextMenu) {
//       window.internalState.contextMenuVisible = false;
//     }

//     const matchesOptionsMenu = ((event.target as HTMLElement).matches('div.opts-menu-container') || (event.target as HTMLElement).matches('div.opts-menu-container > *') || (event.target as HTMLElement).matches('button.fab-options')) ;

//     if (!matchesOptionsMenu) {
//       window.internalState.optionsMenuVisible = false;
//     }

//     const matchesGanttSidebarElement = ((event.target as HTMLElement).matches('div.parent > div.name-container > i.icon'));
//     if (matchesGanttSidebarElement) {
//       const icon = event.target as HTMLElement;

//       const parent = icon.parentElement.parentElement;
      
//       parent.classList.toggle('collapsed');

//       // const icon = parent.querySelector('div.name-container > i.icon');

//       parent.classList.contains('collapsed') ? icon.setAttribute('data-icon', 'arrow-collapse') : icon.setAttribute('data-icon', 'arrow-expand');
//     }

//   });

//   window.addEventListener('blur', (event) => {
//     window.internalState.contextMenuVisible = false;
//     window.internalState.optionsMenuVisible = false;
//   });
// }

// function main(): void {
//   initializeInternalState();
//   listenGlobalEvents();

//   initTitlebar();

//   initNavigationMenu();
//   selectContainer(2);

//   initBlockerUI();
//   initGanttUI();

//   window.backendBridge.onErrorReceived((value: any) => {
//     console.log(value);
//   })
// }

// main();

