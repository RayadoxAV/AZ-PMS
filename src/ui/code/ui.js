const { ipcRenderer, webFrame } = require('electron');

const fabMenu = document.getElementById('fab-menu');
const menuContainer = document.getElementById('menu-container');

const reloadButton = document.getElementById('reload-button');
const zoomInButton = document.getElementById('zoom-in-button');
const zoomOutButton = document.getElementById('zoom-out-button');
const zoomResetButton = document.getElementById('zoom-reset-button');
const collapseButton = document.getElementById('information-collapse-button');
const expandButton = document.getElementById('information-expand-button');
const toggleButton = document.getElementById('toggle-last-week-column');
// const reduceWidthButton = document.getElementById('reduce-width-button');
const settingsButton = document.getElementById('settings-button');
const helpButton = document.getElementById('help-button');

const accInformationDiv = document.getElementById('accomplishments-information');
const risksInformationDiv = document.getElementById('risks-information');


const reportAccomplishmentsTextArea = document.getElementById('report-acc-textarea');
const reportRisksTextArea = document.getElementById('report-risks-textarea');

const blockerTitle = document.getElementById('blocker-title');
blockerTitle.onclick = () => {
  ipcRenderer.send('data-events', { name: 'workplan-open' });
}

const reportTitle = document.getElementById('report-title');
reportTitle.onclick = () => {
  ipcRenderer.send('data-events', { name: 'workplan-open' });
}

function init() {
  
  const fabRect = fabMenu.getBoundingClientRect();
  
  menuContainer.style.top = `${fabRect.top + fabRect.height + 16}px`;
  menuContainer.style.left = `${fabRect.left + (fabRect.width / 2 ) - 16}px`;

  fabMenu.addEventListener('click', () => {
    const visible = menuContainer.style.display === 'flex' ? true : false;

    if (visible) {
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

  collapseButton.addEventListener('click', () => {

    if (!reportAccomplishmentsTextArea.value) {
      accInformationDiv.classList.add('collapsed');
    }

    if (!reportRisksTextArea.value) {
      risksInformationDiv.classList.add('collapsed');
    }
    
  });
  
  expandButton.addEventListener('click', () => {
    accInformationDiv.classList.remove('collapsed');
    risksInformationDiv.classList.remove('collapsed');
  });

  toggleButton.addEventListener('click', () => {
    const table = document.getElementById('report-table');

    console.log(table);

    const header = table.querySelector('th:last-child');

    if (header.innerHTML === 'Last Week Progress') {
      // header.style.display = 'none';
      header.classList.toggle('invisible');

      const tableRows = table.querySelectorAll('tr');

      for (let i = 1; i < tableRows.length; i++) {
        const row = tableRows[i];

        const td = row.querySelector('td:last-child');
        td.classList.toggle('invisible');
      }
    }
  });

  settingsButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'open-settings-window', window: 'Settings' });

  });

  helpButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'open-help-window', window: 'Help' });
  });

  // reduceWidthButton.addEventListener('click', () => {
    // const table = document.getElementById('report-table');

    // const tableRows = table.querySelectorAll('tr');

    // let greatestWidth = -1;

    // for (let i = 1; i < tableRows.length; i++) {
    //   const row = tableRows[i];
    //   const td = row.querySelector('td:first-child');
    //   const span = document.createElement('span');
    //   document.body.appendChild(span);

    //   span.style.font = 'Roboto';
    //   span.style.font = `${14}px`;
    //   span.style.height = 'auto';
    //   span.style.width = 'auto';
    //   span.style.whiteSpace = 'no-wrap';
    //   span.innerHTML =  td.innerHTML;

    //   const width = Math.ceil(span.clientWidth);
    //   console.log(td.clientWidth, width, td.innerHTML);
    //   document.body.removeChild(span);

    //   if (width > greatestWidth) {
    //     greatestWidth = width;
    //   }


    // }

    // console.log(greatestWidth);
  
  // });
}

init();

