const { ipcRenderer } = require("electron");

window.data = {
  isTranslation: false,
  selectedReport: 0
};

/* Blocker */
const blockerTitle = document.getElementById('blocker-title');
const blockerAccElement = document.getElementById('blocker-acc');
const blockerRisksElement = document.getElementById('blocker-risks');
const blockerRemarksElement = document.getElementById('blocker-remarks');
const blockerOnHoldElement = document.getElementById('blocker-onhold');
const blockerStatus = document.getElementById('blocker-status');
const blockerProgressBar = document.getElementById('blocker-progress-bar');
/* Report */
const report = document.getElementById('report-container');
const reportTitle = document.getElementById('report-title');
const reportAccomplishmentsTextArea = document.getElementById('report-acc-textarea');
const reportRisksTextArea = document.getElementById('report-risks-textarea')
const reportStatusContainer = document.getElementById('report-status-container');
const reportProgressBar = document.getElementById('report-progress-bar');
const accomplishmentsTitle = document.getElementById('accomplishments-week');

const copyReport = document.getElementById('copy-report');

const dialogContainer = document.getElementById('dialog-container');
const closeDialogButton = document.getElementById('close-dialog');
const chooseReportSelect = document.getElementById('choose-report-select');
const dialogCancelButton = document.getElementById('dialog-cancel');
const dialogSelectButton = document.getElementById('dialog-select');

function init() {

  closeDialogButton.addEventListener('click', () => {
    dialogContainer.style.display = 'none';
  });

  dialogCancelButton.addEventListener('click', () => {
    dialogContainer.style.display = 'none';
  });

  dialogSelectButton.addEventListener('click', () => {
    window.data.selectedReport = Number.parseInt(chooseReportSelect.value);
    dialogContainer.style.display = 'none';
    convertToHTML();

  });

  listenForEvents();

  copyReport.addEventListener('click', () => {
    if (window.data.isTranslation) {
      dialogContainer.style.display = 'flex';
    } else {
      convertToHTML();
    }
  });

  ipcRenderer.send('data-events', { name: 'load-project' });
}

init();

function listenForEvents() {
  ipcRenderer.on('data-events', (_, args) => {
    switch (args.name) {
      case 'project-loaded': {
        loadProjectData(args.data);
        setupEventsPostLoad();
        break;
      }

      default: {
        break;
      }
    }
  });

}

function loadProjectData(workplanString) {
  const workplan = JSON.parse(workplanString);


  /* Blocker */
  blockerTitle.innerText = workplan.projectName;
  blockerAccElement.innerText = workplan.accomplishments;
  blockerRisksElement.innerText = workplan.risks;
  blockerRemarksElement.innerText = workplan.remarks;
  blockerOnHoldElement.innerText = workplan.onHold;

  const progress = (workplan.projectProgress * 100).toFixed(0);
  const status = workplan.projectStatus;

  blockerStatus.innerText = intToWorkStatusText(status);

  if (status === 0) {
    blockerStatus.classList.add('on-track');
    blockerStatus.classList.remove('out-of-track');
    blockerStatus.classList.remove('behind');

    blockerProgressBar.classList.add('on-track');
    blockerProgressBar.classList.remove('out-of-track');
    blockerProgressBar.classList.remove('behind');


  } else if (status === 1) {
    blockerStatus.classList.add('behind');
    blockerStatus.classList.remove('on-track');
    blockerStatus.classList.remove('out-of-track');

    blockerProgressBar.classList.add('behind');
    blockerProgressBar.classList.remove('on-track');
    blockerProgressBar.classList.remove('out-of-track');

  } else if (status === 2) {
    blockerStatus.classList.add('out-of-track');
    blockerStatus.classList.remove('behind');
    blockerStatus.classList.remove('on-track');

    blockerProgressBar.classList.add('out-of-track');
    blockerProgressBar.classList.remove('behind');
    blockerProgressBar.classList.remove('on-track');

  }

  blockerProgressBar.style = `--progress: ${progress}%`;
  blockerProgressBar.childNodes[1].innerText = `${progress}%`;


  /* Report */
  reportTitle.innerText = workplan.projectName;
  const accomplishments = workplan.report.accomplishments.trim();

  reportAccomplishmentsTextArea.value = accomplishments;
  reportAccomplishmentsTextArea.rows = accomplishments.split('\n').length;

  const risks = workplan.risks.trim();

  reportRisksTextArea.value = risks;
  reportRisksTextArea.rows = risks.split('\n').length;

  reportStatusContainer.innerText = intToWorkStatusText(status);

  if (status === 0) {
    reportStatusContainer.classList.add('on-track');
    reportStatusContainer.classList.remove('out-of-track');
    reportStatusContainer.classList.remove('behind');

    reportProgressBar.classList.add('on-track');
    reportProgressBar.classList.remove('out-of-track');
    reportProgressBar.classList.remove('behind');
  } else if (status === 1) {
    reportStatusContainer.classList.add('behind');
    reportStatusContainer.classList.remove('on-track');
    reportStatusContainer.classList.remove('out-of-track');

    reportProgressBar.classList.add('behind');
    reportProgressBar.classList.remove('out-of-track');
    reportProgressBar.classList.remove('on-track');
  } else if (status === 2) {
    reportStatusContainer.classList.add('out-of-track');
    reportStatusContainer.classList.remove('behind');
    reportStatusContainer.classList.remove('on-track');

    reportProgressBar.classList.add('out-of-track');
    reportProgressBar.classList.remove('on-track');
    reportProgressBar.classList.remove('behind');
  }

  reportProgressBar.style = `--progress: ${progress}%`;
  reportProgressBar.childNodes[1].innerText = `${progress}%`;


  let maxDate = new Date(1900, 0, 1);
  for (let i = 0; i < workplan.milestones.length; i++) {
    const milestone = workplan.milestones[i];

    if (milestone.finishDate) {
      const realDate = new Date(milestone.finishDate.date)
      if (realDate.getTime() > maxDate.getTime()) {
        maxDate = realDate;
      }

    }

  }

  document.getElementById('target-date').innerText = `Target date: ${maxDate.getFullYear()}/${maxDate.getMonth() + 1}/${maxDate.getDate()}`

  const currentWeek = dateToWeek(new Date());

  accomplishmentsTitle.innerText = `Accomplishments (WK${currentWeek})`;

  fillReport(workplan);

  const isTranslation = workplan.projectId === 'TR-1';

  if (isTranslation) {
    window.data = {
      isTranslation: isTranslation,
      selectedReport: 0
    };
    fillSubmissionsReport(workplan);

    /* Para traducciones se tienen dos reportes.
    El blocker report con fechas y todo normal.
    Y el blocker report para el reporte semanal */
    /* Realmente uno es modificación del otro. Puedo agregar HTML dinamico bajo el reporte para no tener que modificar index.html
    Sip, y simplemente lo someto a las mismas modificaciones para que se puedan alterar los status del proyecto.
    Y quitamos las todas las fechas para el reporte semanal.
    
    */

    generateTranslationsWeeklyReport(workplan);

    const statuses = ['on-track', 'behind', 'out-of-track'];

    reportStatusContainer.addEventListener('click', (event) => {


      const progressContainer = event.target;
      let currentStatusInt = stringToWorkStatusInt(progressContainer.classList[1]);

      const trReportStatus = document.getElementById('tr-weekly-report-status');
      const trReportProgressBar = document.getElementById('tr-weekly-report-progress-bar');

      progressContainer.classList.remove(statuses[currentStatusInt]);
      reportProgressBar.classList.remove(statuses[currentStatusInt]);

      trReportStatus.classList.remove(statuses[currentStatusInt]);
      trReportProgressBar.classList.remove(statuses[currentStatusInt]);

      if (currentStatusInt === 2) {
        currentStatusInt = 0;
      } else {
        currentStatusInt += 1;
      }

      progressContainer.classList.add(statuses[currentStatusInt]);
      progressContainer.innerHTML = intToWorkStatusText(currentStatusInt);
      reportProgressBar.classList.add(statuses[currentStatusInt]);

      trReportStatus.classList.add(statuses[currentStatusInt]);
      trReportStatus.innerHTML = intToWorkStatusText(currentStatusInt);
      trReportProgressBar.classList.add(statuses[currentStatusInt]);

    });
  }
}

function fillReport(workplan) {
  const isTranslation = workplan.projectId === 'TR-1';

  if (isTranslation) {
    const table = document.getElementById('report-table');
    const remainingHeader = table.querySelector('thead > tr > th:nth-child(7)');

    const testColumn = table.querySelector('thead > tr > th:nth-child(8)');

    if (testColumn.innerText !== 'Worked last week') {
      const lastWeekHeader = document.createElement('th');
      lastWeekHeader.innerText = 'Worked last week';

      remainingHeader.after(lastWeekHeader);
    }
  }

  const tableBody = document.getElementById('report-body');

  let tableHTML = '';

  for (let i = 0; i < workplan.report.reportingItems.length; i++) {
    const item = workplan.report.reportingItems[i];

    if (isTranslation && item.name === 'New Submissions') {
      break;
    }

    if (item.tasks) {

      let startDate = undefined;
      let finishDate = undefined;

      if (item.startDate) {
        if (item.startDate.date === '2500-01-01T06:00:00.000Z') {
          startDate = 'TBD';
        } else {
          startDate = item.startDate.date.split('T')[0].replace(/\-/g, '/');
        }
      }

      if (item.finishDate) {
        finishDate = item.finishDate.date.split('T')[0].replace(/\-/g, '/');
      }

      let status = undefined;

      if (item.workStatus === 0) {
        status = 'on-track';
      } else if (item.workStatus === 1) {
        status = 'behind';
      } else if (item.workStatus === 2) {
        status = 'out-of-track';
      }

      tableHTML +=
        `<tr class="milestone">
        <td>${item.name}</td>
        <td>${startDate}</td>
        <td>${finishDate}</td>
        <td></td>
        <td></td>
        <td>${item.target > 0 ? numberWithCommas(item.target) : ''}</td>
        <td>${item.remaining === 0 ? '' : numberWithCommas(item.remaining)}</td>
        ${isTranslation ? '<td></td>' : ''}
        <td>
          <div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(0)}%;">
            <span>${(item.progress * 100).toFixed(0)}%</span>
            <div class="progress-background"></div>
          </div>
        </td>
        <td class="invisible">
          <div id="progress-bar-${i}" class="progress-bar difference" style="--progress: 0%; width: 100%;" data-status="0">
            <span contenteditable="true">0%</span>
            <div class="progress-background"></div>
          </div>
        </td>
      </tr>`
    } else {

      let startDate = undefined;
      let finishDate = undefined;
      let newFinishDate = undefined;
      let actualDate = undefined;

      if (item.startDate) {
        if (item.startDate.date) {
          startDate = item.startDate.date.split('T')[0].replace(/\-/g, '/');
        }
      }

      if (item.finishDate) {
        if (item.finishDate.date) {
          finishDate = item.finishDate.date.split('T')[0].replace(/\-/g, '/');
        }
      }

      if (item.newFinishDate) {
        if (item.newFinishDate.date) {
          newFinishDate = item.newFinishDate.date.split('T')[0].replace(/\-/g, '/');
        }
      }

      if (item.actualDate) {
        if (item.actualDate.date) {
          actualDate = item.actualDate.date.split('T')[0].replace(/\-/g, '/');
        }
      }

      let status = undefined;

      if (item.workStatus === 0) {
        status = 'on-track';
      } else if (item.workStatus === 1) {
        status = 'behind';
      } else if (item.workStatus === 2) {
        status = 'out-of-track';
      }

      tableHTML +=
        `<tr>
        <td>${item.name}</td>
        <td>${startDate || 'TBD'}</td>
        <td>${finishDate || 'TBD'}</td>
        <td>${newFinishDate || ''}</td>
        <td>${actualDate || ''}</td>
        <td>${item.target > 0 ? numberWithCommas(item.target) : ''}</td>
        <td>${(item.target > 0) ? numberWithCommas(item.remaining) : ''}</td>
        ${isTranslation ? `<td>${item.workedLastWeek > 0 ? numberWithCommas(optionalFieldWrapper(item, 'workedLastWeek')) : ''}</td>` : ''}
        <td>
          ${item.flag !== 3
          ? `<div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(0)}%;">
            <span>${(item.progress * 100).toFixed(0)}%</span>
            <div class="progress-background"></div>
          </div>` : ''
        }
        </td>
        <td class="invisible">
          <div id="progress-bar-${i}" class="progress-bar difference" style="--progress: 0%; width: 100%;" data-status="0">
            <span contenteditable="true">0%</span>
            <div class="progress-background"></div>
          </div>
        </td>
      </tr>`;
    }
  }

  tableBody.innerHTML = tableHTML;
}

function intToWorkStatusText(workStatusInt) {
  let workStatusText = '';

  switch (workStatusInt) {
    case 0:
      workStatusText = 'On Track';
      break;

    case 1:
      workStatusText = 'Behind';
      break;

    case 2:
      workStatusText = 'Out of Track';
      break;

    default:
      workStatusText = '';
      break;
  }

  return workStatusText;
}

function stringToWorkStatusInt(workStatusString) {
  let workStatusInt = -1;

  switch (workStatusString) {
    case 'on-track':
      workStatusInt = 0;
      break;

    case 'behind':
      workStatusInt = 1;
      break;

    case 'out-of-track':
      workStatusInt = 2;
      break;

    default:
      workStatusInt = 0;
      break;
  }

  return workStatusInt;
}

function numberWithCommas(x) {
  try {
    const number = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return number;
  } catch (_) {
    return '-';
  }
}

function convertToHTML() {
  const domToImg = require('dom-to-image');

  function filterNodes(node) {
    return (node.tagName !== 'BUTTON');
    // return true;
  }

  const translationsReport = document.getElementById('tr-report');

  const node = window.data.selectedReport === 0 ? report : translationsReport;

  domToImg.toPng(node, { filter: filterNodes }).then((dataUrl) => {
    const byteCharacters = atob(dataUrl.substring(22));

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: 'image/png' });

    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]).then(() => {
      alert('Copied report!');
    })

  }).catch((error) => {
    console.log(error);
  });
}

function dateToWeek(date) {
  const searchString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const week = dates[searchString];
  return week;
}


function optionalFieldWrapper(item, fieldName) {
  if (item[fieldName] !== undefined && item[fieldName] !== null) {
    return item[fieldName];
  }
  return '';
}

function fillSubmissionsReport(workplan) {
  const currentWeek = dateToWeek(new Date());

  const reportTable = document.getElementById('report-table');

  const submissionsTable = document.createElement('table');
  submissionsTable.classList.add('milestone-container');
  submissionsTable.style.borderTop = '2px solid #475469';
  submissionsTable.style.marginTop = '1rem';

  const thead = document.createElement('thead');

  const tbody = document.createElement('tbody');



  let shouldSkip = true;

  let bodyHTML = '';

  for (let i = 0; i < workplan.report.reportingItems.length; i++) {
    const item = workplan.report.reportingItems[i];

    if (item.name === 'New Submissions') {
      shouldSkip = false;

      thead.innerHTML =
        `
        <tr>
          <th>${item.name}</th>
          <th>Start date</th>
          <th>Finish date</th>
          <th>Total translated</th>
          <th>Received (WK${currentWeek - 1})</th>
          <th>Worked (WK${currentWeek - 1})</th>
          <th>Progress</th>
        </tr>
      `;

      continue;
    }

    if (shouldSkip) {
      continue;
    }

    let startDate = undefined;
    let finishDate = undefined;
    let actualDate = undefined;

    if (item.startDate) {
      if (item.startDate.date) {
        startDate = item.startDate.date.split('T')[0].replace(/\-/g, '/');
      }
    }

    if (item.finishDate) {
      if (item.finishDate.date) {
        finishDate = item.finishDate.date.split('T')[0].replace(/\-/g, '/');
      }
    }


    bodyHTML +=
      `
      <tr>
        <td>${item.name}</td>
        <td>${startDate}</td>
        <td>${finishDate}</td>
        <td>${numberWithCommas(item.completed)}</td>
        <td>${numberWithCommas(item.receivedLastWeek)}</td>
        <td>${numberWithCommas(item.workedLastWeek)}</td>
        <td>
          <div class="progress-bar difference" style="--progress: ${(item.workedLastWeek / item.receivedLastWeek * 100).toFixed(0)}%;">
            <span>${(item.workedLastWeek / item.receivedLastWeek * 100).toFixed(2)}%</span>
            <div class="progress-background"></div>
          </div>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = bodyHTML;

  submissionsTable.appendChild(thead);
  submissionsTable.appendChild(tbody);

  reportTable.after(submissionsTable);
}

function generateTranslationsWeeklyReport(workplan) {
  const reportContainer = document.createElement('div');
  reportContainer.classList.add('report');
  reportContainer.id = 'tr-report';

  const projectStatus = workplan.projectStatus;
  const projectProgress = (workplan.projectProgress * 100).toFixed(0);

  reportContainer.innerHTML =
    `<div class="header">
    <span class="title">${workplan.projectName}</span>
    <div style="display: flex">
      <div id="tr-weekly-report-status" class="status-container ${intToStatusClass(projectStatus)}">${intToWorkStatusText(projectStatus)}</div>
      <div class="progress-container">
        <div id="tr-weekly-report-progress-bar" class="progress-bar ${intToStatusClass(projectStatus)}" style="--progress: ${projectProgress}%">
          <span>${projectProgress}%</span>
          <div class="progress-background"></div>
        </div>
      </div>
    </div>
  </div>
    <table class="milestone-container">
      <thead>
        <tr>
          <th>Milestones</th>
          <th>Target</th>
          <th>Remaining</th>
          <th>Worked Last Week</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        ${generateRows(workplan.report.reportingItems)}
      </tbody>
    </table>
    ${generateSubmissionRows(workplan.report.reportingItems)}
  `;

  const container = document.getElementById('main-container');


  container.appendChild(reportContainer);

  function generateRows(reportingItems) {

    let tableHTML = '';

    for (let i = 0; i < reportingItems.length; i++) {
      const item = reportingItems[i];

      if (item.name === 'New Submissions') {
        break;
      }

      if (item.tasks) {
        let status = undefined;

        if (item.workStatus === 0) {
          status = 'on-track';
        } else if (item.workStatus === 1) {
          status = 'behind';
        } else if (item.workStatus === 2) {
          status = 'out-of-track';
        }

        tableHTML +=
          `<tr class="milestone">
            <td>${item.name}</td>
            <td>${item.target > 0 ? numberWithCommas(item.target) : ''}</td>
            <td>${item.remaining === 0 ? '' : numberWithCommas(item.remaining)}</td>
            <td></td>
            <td>
              <div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(2)}%">
                <span>${(item.progress * 100).toFixed(0)}%</span>
                <div class="progress-background"></div>
              </div>
            </td>
          </tr>`;
      } else {
        let status = undefined;

        if (item.workStatus === 0) {
          status = 'on-track';
        } else if (item.workStatus === 1) {
          status = 'behind';
        } else if (item.workStatus === 2) {
          status = 'out-of-track';
        }

        tableHTML +=
          `<tr>
          <td>${item.name}</td>
          <td>${item.target > 0 ? numberWithCommas(item.target) : ''}</td>
          <td>${item.target > 0 ? numberWithCommas(item.remaining) : ''}</td>
          <td></td>
          <td>
            ${item.flag !== 3
            ?
            `<div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(0)}%">
                <span>${(item.progress * 100).toFixed(0)}%</span>
                <div class="progress-background"></div>
              </div>` : ''
          }
          </td>
        </tr>`;
      }
    }

    return tableHTML;
  }

  function generateSubmissionRows(reportingItems) {
    let tableHTML =
      `<table class="milestone-container" style="border-top: 2px solid #475469; margin-top: 1rem;">
      <thead>`;

    let shouldSkip = true;


    for (let i = 0; i < reportingItems.length; i++) {
      const item = reportingItems[i];

      if (item.name === 'New Submissions') {
        shouldSkip = false;

        tableHTML +=
          `<tr>
          <th>${item.name}</th>
          <th>Total translated</th>
          <th>Received (WK)</th>
          <th>Worked(WK)</th>
          <th>Progress</th>
        </tr>
        </thead>
        <tbody>`;

        continue;
      }
      if (shouldSkip) {
        continue;
      }

      tableHTML +=
        `<tr>
        <td style="height: 20px">${item.name}</td>
        <td>${numberWithCommas(item.completed)}</td>
        <td>${numberWithCommas(item.receivedLastWeek)}</td>
        <td>${numberWithCommas(item.workedLastWeek)}</td>
        <td>
          <div class="progress-bar difference" style="--progress: ${(item.workedLastWeek / item.receivedLastWeek * 100).toFixed(0)}%;">
            <span>${(item.workedLastWeek / item.receivedLastWeek * 100).toFixed(2)}%</span>
            <div class="progress-background"></div>
          </div>
        </td>
      </tr>`;
    }

    tableHTML += '</tbody></table>';

    return tableHTML;
  }

  function intToStatusClass(statusInput) {
    let statusClass = '';

    switch (statusInput) {
      case 0:
        statusClass = 'on-track';
        break;
      case 1:
        statusClass = 'behind';
        break;
      case 2:
        statusClass = 'out-of-track';
        break;
      default:
        statusClass = 'on-track';
        break;
    }

    return statusClass;
  }
}

function setupEventsPostLoad() {

  const statuses = ['difference', 'out-of-track'];

  document.querySelectorAll('table.milestone-container > tbody > tr > td:last-child > div.progress-bar').forEach((element) => {
    const progressBarElement = element;

    const span = progressBarElement.querySelector('span');
    span.addEventListener('keyup', (event) => {
      progressBarElement.style = `--progress: ${event.target.innerText}; width: 100%;`;
    });

    progressBarElement.addEventListener('click', (event) => {
      // console.log(event.target, event.currentTarget);

      if (event.target.matches('div.progress-bar')) {
        let status = Number.parseInt(progressBarElement.getAttribute('data-status'));
        progressBarElement.classList.remove(statuses[status]);
        if (status < 1) {
          status += 1;
        } else {
          status = 0;
        }
        progressBarElement.setAttribute('data-status', status);
        progressBarElement.classList.add(statuses[status]);

      }
    });

  });
}