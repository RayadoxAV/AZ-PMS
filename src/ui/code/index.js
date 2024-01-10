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
const reportTitle = document.getElementById('report-title');
const reportAccomplishmentsTextArea = document.getElementById('report-acc-textarea');

function init() {
  listenForEvents();

  ipcRenderer.send('data-events', { name: 'load-project' });
}

init();

function listenForEvents() {
  ipcRenderer.on('data-events', (_, args) => {
    switch (args.name) {
      case 'project-loaded': {
        loadProjectData(args.data)
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
  console.log(blockerProgressBar.childNodes);

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

  reportAccomplishmentsTextArea.innerText = workplan.report.accomplishments;
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