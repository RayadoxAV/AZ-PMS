const Util = require("../util/util");
const { Workplan } = require("./types");

class InferenceEngine {

  static inferProjectWorkStatus(workplan) {
    let onTime = 0;
    let delayed = 0;
    let late = 0;
    let taskCount = 0;

    let workStatus = -1;

    let currentDate = undefined;

    let dateDifference = 0;

    if (workplan.type === 0) {
      currentDate = Util.dateToWeek(new Date());
    } else {
      currentDate = new Date();
    }

    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];

      for (let j = 0; j < milestone.tasks.length; j++) {
        const task = milestone.tasks[j];
        // Date Diffing
        if (workplan.type === 0) {

          if (task.newFinishDate) {
            dateDifference = task.newFinishDate.week - currentDate;
          } else if (task.finishDate) {
            dateDifference = task.finishDate.week - currentDate;
          } else {
            dateDifference = 10000;
          }

        } else {
          const dayUnit = 1000 * 60 * 60 * 24;

          if (task.newFinishDate) {
            dateDifference = Math.ceil((task.newFinishDate.date.getTime() - currentDate.getTime()) / dayUnit);
          } else if (task.finishDate) {
            dateDifference = Math.ceil((task.finishDate.date.getTime() - currentDate.getTime()) / dayUnit);
          } else {
            dateDifference = 10000;
          }
        }

        const timeResult = Util.isOnTime(task, workplan.type)

        if (task.status !== 2 & dateDifference < 0) {
          late++;
        } else if (task.status !== 2 && task.status !== 4 && !timeResult.onTime) {
          delayed++;
        }
        taskCount++;
      }
    }

    onTime = taskCount - late - delayed;

    if (delayed >= 2) {
      workStatus = 1;
    } else if (late >= 3) {
      workStatus = 2;
    } else {
      workStatus = 0;
    }

    return workStatus;
  }

  static inferMilestoneStartDate(milestone) {

    if (milestone.tasks.length === 0) {
      return;
    }

    let minimumDate = new Date(2500, 0, 1);

    let minimumWeek = 0;

    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];
      if (task.startDate) {
        if (task.startDate.date.getTime() < minimumDate.getTime()) {
          minimumDate = task.startDate.date;
          minimumWeek = task.startDate.week;
        }
      }
    }

    return { date: minimumDate, week: minimumWeek };
  }

  static inferMilestoneFinishDate(milestone) {
    if (milestone.tasks.length === 0) {
      return;
    }

    let maximumDate = new Date(1900, 0, 1);
    let maximumWeek = 0;

    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];

      if (task.newFinishDate) {

        if (task.newFinishDate.date.getTime() > maximumDate.getTime()) {
          maximumDate = task.newFinishDate.date;
          maximumWeek = task.newFinishDate.week;
        }

      } else if (task.finishDate) {
        if (task.finishDate.date.getTime() > maximumDate.getTime()) {
          maximumDate = task.finishDate.date;
          maximumWeek = task.finishDate.week;
        }
      }
    }

    return { date: maximumDate, week: maximumWeek };
  }

  static inferMilestoneStatus(milestone) {
    let notStarted = 0;
    let inWork = 0;
    let completed = 0;
    let onHold = 0;
    let cancelled = 0;

    let status = -1;

    if (milestone.tasks.length === 0) {
      return;
    }

    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];

      switch (task.status) {
        case 0:
          notStarted++;
          break;

        case 1:
          inWork++;
          break;

        case 2:
          completed++;
          break;

        case 3:
          onHold++;
          break;

        case 4:
          cancelled++;
          break;

        default:
          break;
      }
    }

    if (inWork > 0) {
      status = 1;
    }

    if (onHold > 2) {
      status = 3;
    }

    if (completed === milestone.tasks.length) {
      status = 2;
    }

    if (cancelled === milestone.tasks.length) {
      status = 4;
    }

    if (notStarted === milestone.tasks.length) {
      status = 0;
    }

    if (status === -1) {
      status = 1;
    }

    return status;
  }

  static inferMilestoneWorkStatus(milestone, type) {
    let workStatus = 0;

    if (milestone.tasks.length === 0) {
      return 0;
    }

    let tasksLate = 0;

    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];

      if (task.status !== 2 && task.status !== 4 && !Util.isOnTime(task, type).onTime) {
        tasksLate++;
      }
    }

    if (tasksLate < 2) {
      workStatus = 0;
    } else if (tasksLate > 2 && tasksLate < 4) {
      workStatus = 1;
    } else if (tasksLate >= 4) {
      workStatus = 2;
    }

    return workStatus;
  }

  static inferMilestoneProgress(milestone) {
    let progress = 0;
    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];
      progress += task.progress;
    }
    return progress / milestone.tasks.length;
  }

  /**
   * 
   * @param {Workplan} workplan 
   */
  infer(workplan) {
    // this.generateAccomplishments(workplan);
    const accomplishments = this.generateAccomplishments(workplan);
    const risks = this.generateRisks(workplan);
    const remarks = this.generateRemarks(workplan);
    const onHold = this.generateOnHold(workplan);

    return {
      accomplishments,
      risks,
      remarks,
      onHold
    };
  }

  generateAccomplishments(workplan) {

    let accomplishmentsString = '';
    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];

      if (milestone.flag === 1) {
        accomplishmentsString += `- [${milestone.name}] is completed. (WK${milestone.finishDate ? milestone.finishDate.week : ''})\n`
      } else {
        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          let dateDifference = undefined;

          if (workplan.type === 0) {
            const currentWeek = Util.dateToWeek(new Date());

            if (task.newFinishDate) {
              dateDifference = task.newFinishDate.week - currentWeek;
            } else if (task.finishDate) {
              dateDifference = task.finishDate.week - currentWeek;
            } else {
              dateDifference = 10000;
            }

          } else {
            const currentDate = new Date();
            const dayUnit = 1000 * 60 * 60 * 24;

            if (task.newFinishDate) {
              dateDifference = Math.ceil((task.newFinishDate.date.getTime() - currentDate.getTime()) / dayUnit)
            } else if (task.finishDate) {
              dateDifference = Math.ceil((task.finishDate.date.getTime() - currentDate.getTime()) / dayUnit);
            } else {
              dateDifference = 10000;
            }
          }

          if (task.flag === 1) {
            accomplishmentsString += `- [${task.name}] is completed. (WK${task.actualDate.week})\n`;
          } else if (task.status === 2) {
            accomplishmentsString += `- [${task.name}] is completed. (WK${task.actualDate.week})\n`;
          } else if (task.status === 1 && task.progress >= 0.75 && dateDifference < 2) {
            accomplishmentsString += `- [${task.name}] is at ${(task.progress * 100).toFixed(0)}% progress.\n`;
          }
        }
      }
    }

    return accomplishmentsString;
  }

  generateRisks(workplan) {
    let risksString = '';

    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];

      if (milestone.flag === 2) {
        risksString += `- [${milestone.name}] Milestone, ${milestone.remarks}\n`;
      }

      for (let j = 0; j < milestone.tasks.length; j++) {
        const task = milestone.tasks[j];

        if (task.flag === 2) {
          risksString += `- [${task.name}] ${task.remarks}\n`;
        } else {
          const timeResult = Util.isOnTime(task, workplan.type);
          if (task.status !== 4 && task.status !== 3 && !timeResult.onTime) {

            if (task.target > 0) {
              risksString = `- [${task.name}] is behind plan (${task.completed} vs ${task.target})\n`;
            } else {
              risksString = `- [${task.name}] is behind plan (${timeResult.timeBehind} ${timeResult.unit})\n`;
            }
          }
        }
      }
    }

    return risksString;
  }

  generateRemarks(workplan) {
    return workplan.projectRemarks;
  }

  generateOnHold(workplan) {
    let onHoldString = '';

    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];

      if (milestone.status === 3) {
        onHoldString += `- [${milestone.name}] is On Hold. ${milestone.remarks || ''}\n`;
      } else {

        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          if (task.status === 3) {
            onHoldString += `- [${task.name}] is On Hold. ${task.remarks || ''}\n`;
          }
        }
      }
    }

    return onHoldString;
  }

  generateReportMilestones() {

  }
}

module.exports = { InferenceEngine };
