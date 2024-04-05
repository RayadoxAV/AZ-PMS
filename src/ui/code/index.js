const { ipcRenderer } = require("electron");

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

function init() {
  listenForEvents();

  copyReport.addEventListener('click', () => {
    convertToHTML();
  });

  ipcRenderer.send('data-events', { name: 'load-project' });
}

init();

function listenForEvents() {
  ipcRenderer.on('data-events', (_, args) => {
    switch (args.name) {
      case 'project-loaded': {
        loadProjectData(args.data);
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

  console.log(workplan);

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
    fillSubmissionsReport(workplan);
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
        <td>${item.target === -1 ? '' : numberWithCommas(item.target)}</td>
        <td>${item.remaining === 0 ? '' : numberWithCommas(item.remaining)}</td>
        ${isTranslation ? '<td></td>' : ''}
        <td>
          <div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(0)}%;">
            <span>${(item.progress * 100).toFixed(0)}%</span>
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
        <td>${item.target === -1 ? '' : numberWithCommas(item.target)}</td>
        <td>${(item.target > 0) ? numberWithCommas(item.remaining) : ''}</td>
        ${isTranslation ? `<td>${item.workedLastWeek > 0 ? numberWithCommas(optionalFieldWrapper(item, 'workedLastWeek')) : ''}</td>` : ''}
        <td>
          <div class="progress-bar ${status}" style="--progress: ${(item.progress * 100).toFixed(0)}%;">
            <span>${(item.progress * 100).toFixed(0)}%</span>
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

  domToImg.toPng(report, { filter: filterNodes }).then((dataUrl) => {
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
          <div class="progress-bar on-track" style="--progress: ${(item.workedLastWeek / item.receivedLastWeek * 100).toFixed(0)}%;">
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