class Task {
  name = '';
  flag = -1;
  responsible = '';
  status = -1;
  progress = 0;
  duration = 0;

  startDate = undefined;
  finishDate = undefined;
  newFinishDate = undefined;
  actualDate = undefined;

  completed = 0;
  target = 0;
  remaining = 0;
  
  remarks = '';
  comments = '';


  constructor(name, flag, responsible, status, progress, duration, startDate, finishDate, newFinishDate, actualDate, completeed, target, remaining, remarks, comments) {
    this.name = name;
    this.flag = flag;
    this.responsible = responsible;
    this.status = status;
    this.progress = progress;
    this.duration = duration;
    this.startDate = startDate;
    this.finishDate = finishDate;
    this.newFinishDate = newFinishDate;
    this.actualDate = actualDate;
    this.completed = completed;
    this.target = target;
    this.remaining = remaining;
    this.remarks = remarks;
    this.comments = comments; 
  }


  
}

class Milestone {
  name = '';
  flag = -1;
  status = -1;
  progress = 0;
  tasks = [];

  startDate = undefined;
  finishDate = undefined;

  completed = 0;
  remaining = 0;
  target = 0;

  remarks = '';
  comments = '';

  row = -1;

  constructor(name, flag, row) {
    this.name = name;
    this.flag = flag;
    this.row = row;
  }
}

class Workplan {
  pathOrURL = '';

  projectId = '';
  projectName = '';
  projectObjective = '';
  projectOwner = '';
  // Object shape: { date: Date, week: Number }
  projectStartDate = undefined;
  projectRemarks = '';
  projectProgress = 0;

  projectStatus = -1;
  milestones = [];
  type = -1;
  version = '';

  constructor(pathOrURL, projectId, projectName, projectObjective, projectOwner, projectStartDate, projectRemarks, projectProgress) {
    this.pathOrURL = pathOrURL;
    this.projectId = projectId;
    this.projectName = projectName;
    this.projectObjective = projectObjective;
    this.projectOwner = projectOwner;
    this.projectStartDate = projectStartDate;
    this.projectRemarks = projectRemarks;
    this.projectProgress = projectProgress;
  }
}

module.exports = {
  Task,
  Milestone,
  Workplan
};
