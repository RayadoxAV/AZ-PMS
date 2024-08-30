const Util = require("../util/util");
const { PersistenceManager } = require("./persistenceManager");
const { Workplan } = require("./types");

class InferenceEngine {

  static inferProjectWorkStatus(workplan) {

    if (workplan.type !== 0) {
      return 0;
    }

    if (workplan.version === 'v3') {
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
          const timeResult = Util.isOnTime(task, workplan.type, workplan.version);
  
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
    } else if (workplan.version === 'v4') {

      let onTime = 0;
      let delayed = 0;
      let late = 0;

      let workStatus = 0;

      for (let i = 0; i < workplan.milestones.length; i++) {
        const milestone = workplan.milestones[i];

        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          const timeResult = Util.isOnTime(task, workplan.type, workplan.version);

          if (task.status !== 2 && task.status !== 4 && !timeResult.onTime) {
            if (timeResult.timeBehind > 2) {
              late++;
            } else {
              delayed++;
            }
          } else {
            onTime++;
          }
        }
      }
      
      if (delayed >= 2) {
        workStatus = 1;
      } else if (late >= 3) {
        workStatus = 2;
      } else {
        workStatus = 0;
      }

      return workStatus;

    }


    return 0;
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

  static inferMilestoneWorkStatus(milestone, type, version) {
    let workStatus = 0;

    if (milestone.tasks.length === 0) {
      return 0;
    }

    let tasksLate = 0;

    for (let i = 0; i < milestone.tasks.length; i++) {
      const task = milestone.tasks[i];

      if (task.status !== 2 && task.status !== 4 && !Util.isOnTime(task, type, version).onTime) {
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

  static inferTaskWorkStatus(task, type, version) {
    let workStatus = undefined;

    const timeResult = Util.isOnTime(task, type, version);

    if (type === 0) {
      if (timeResult.timeBehind === 0) {
        workStatus = 0;
      } else if (timeResult.timeBehind <= 2) {
        workStatus = 1;
      } else if (timeResult.timeBehind >= 4) {
        workStatus = 2;
      }
    } else {
      if (timeResult.timeBehind < 7) {
        workStatus = 0;
      } else if (timeResult <= 13) {
        workStatus = 1;
      } else if (timeResult >= 14) {
        workStatus = 2;
      }
    }

    return workStatus;
  }

  static inferMilestoneProgress(milestone) {

    if (milestone.tasks.length === 0) {
      return 0;
    }

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
  async infer(workplan) {
    // this.generateAccomplishments(workplan);
    const accomplishments = await this.generateAccomplishments(workplan);
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

  async generateAccomplishments(workplan) {

    let accomplishmentsString = '';
    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];
      if (milestone.flag === 1 || milestone.status === 2) {
      
        /* NOTE: Algorithm
          1. Figure out if the milestone should be reported.
            1.1 Check if it is already in the DB.
            1.2 If it is, then check if its reported date is recent enough to show. (currentWeek | currentWeek - 1)
              1.2.1 Milestones only have a finishDate. If it is a weekly workplan, check for weeks. Check for 10 days otherwise
            1.3 If it is not, then report it and add it to the DB.
        */

        const result = await PersistenceManager.searchInDB(workplan.projectId, milestone.name);

        if (result) {
          if (workplan.type === 0) {
            const currentWeek = Util.dateToWeek(new Date());
            const week = result.reportedDate.week;
            if (currentWeek <= week) {
              accomplishmentsString += `- 100% - ${milestone.name} (WK${week}).\n`;
            }
          } else {
            const tempDate = new Date(new Date() - 21600000);

            const currentDate = new Date(`${tempDate.getFullYear()}-${tempDate.getMonth() + 1}-${tempDate.getDate()}`);
            const date = milestone.finishDate.date;
            const dayUnit = 1000 * 60 * 60 * 24;

            if (currentDate - (5 * dayUnit) <= date.getTime()) {
              accomplishmentsString += `- 100% - ${milestone.name} (WK${milestone.finishDate.week}).\n`;
            }            
          }
        } else {

          accomplishmentsString += `100% - ${milestone.name} (WK${milestone.finishDate.week}).\n`;          

          const newEntry = {
            name: milestone.name,
            completionDate: {
              week: milestone.finishDate.week,
              date: milestone.finishDate.date
            }
          };

          await PersistenceManager.addToDB(workplan.projectId, newEntry, 'milestone');
        }

      } else {

        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          if (task.flag === 1 || task.status === 2) {
            const result = await PersistenceManager.searchInDB(workplan.projectId, task.name);

            if (result) {
              if (workplan.type === 0) {
                const currentWeek = Util.dateToWeek(new Date());
                const week = result.reportedDate.week;
                if (currentWeek <= week) {
                  let taskCompletionDate = Util.getActualDate(task);
                  accomplishmentsString += `- 100% - ${task.name} (WK${taskCompletionDate.week}).\n`;
                }
              } else {
                const tempDate = new Date(new Date() - 21600000);

                const currentDate = new Date(`${tempDate.getFullYear()}-${tempDate.getMonth() + 1}-${tempDate.getDate()}`);
                const date = new Date(result.reportedDate.date);
                const dayUnit = 1000 * 60 * 60 * 24;

                if (currentDate - (5 * dayUnit) <= date.getTime()) {
                  let taskCompletionDate = Util.getActualDate(task);
                  accomplishmentsString += `- 100% - ${task.name} (WK${taskCompletionDate.week}).\n`;
                }
              }
            } else {
            
              // Report and add to DB
              let taskCompletionDate = Util.getActualDate(task);
              // TODO: Handle errors gracefully
              accomplishmentsString += `100% - ${task.name} (WK${taskCompletionDate.week}).\n`

              const newEntry = {
                name: task.name,
                completionDate: {
                  week: taskCompletionDate.week,
                  date: taskCompletionDate.date
                }
              };

              await PersistenceManager.addToDB(workplan.projectId, newEntry, 'task');
            }

          } else if (task.progress >= 0.75) {
            if (task.flag === 3) {
              continue;
            }
            /* NOTE: Algorithm
              1. If it has a completion date that is close and it is in work and does not have a risk flag. I'm just going to ignore the calculated risks if any.
            */
            let hasNighCompletionDate = false;
            let isInWork = false;
            let isNotRisk = false;

            if (workplan.type === 0) {
              const currentWeek = Util.dateToWeek(new Date());
              const finishDate = Util.getFinishDate(task);

              if (currentWeek + 2 <= finishDate.week) {
                hasNighCompletionDate = true;
              }
            } else {
              const tempDate = new Date(new Date() - 21600000);

              const currentDate = new Date(`${tempDate.getFullYear()}-${tempDate.getMonth() + 1}-${tempDate.getDate()}`);
              const dayUnit = 1000 * 60 * 60 * 24;

              const finishDate = Util.getFinishDate(task);

              // TODO: Test with Scrum workplan
              if (currentDate + (5 * dayUnit) <= new Date(finishDate.date).getTime()) {
                hasNighCompletionDate = true;
              }
            }

            if (task.status === 1) {
              isInWork = true;
            } else {
              isInWork = false;
            }

            if (task.flag !== 2) {
              isNotRisk = true;
            } else {
              isNotRisk = false;
            }

            if (hasNighCompletionDate && isInWork && isNotRisk) {
              let finishDate = Util.getFinishDate(task);

              // TODO: Let the user decide if they want to see the ETA.
              accomplishmentsString += `- ${(task.progress * 100).toFixed(0)}% - ${task.name}.\n`;
            }
          }
        }
      }
    }

    return accomplishmentsString.trim();
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
          // console.log(milestone.tasks);
          risksString += `- [${task.name}] ${task.remarks}\n`;
        } else {
          const timeResult = Util.isOnTime(task, workplan.type, workplan.version);
          // console.log(task.name, timeResult);


          // console.log(timeResult, task.name);

          if (task.status !== 4 && task.status !== 3 && !timeResult.onTime) {
            if (task.target > 0) {
              if (task.completed === -1) {
                task.completed = 0;
              }

              risksString += `- [${task.name}] is behind plan (${task.completed} vs ${task.target})\n`;
            } else {
              risksString += `- [${task.name}] is behind plan (${timeResult.timeBehind} ${timeResult.unit})\n`;
            }
          }
        }
      }
    }

    return risksString.trim();
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

  generateReport(workplan) {
    const accomplishments = this.generateReportAccomplishments(workplan)
    const risks = this.generateReportRisks(workplan);
    const reportingItems = this.generateReportingItems(workplan);

    return {
      accomplishments,
      reportingItems
    };
  }

  generateReportAccomplishments(workplan) {
    let accomplishmentsString = '';

    const currentDate = Util.dateToWeek(new Date());


    for (let i = 0; i < workplan.milestones.length; i++) {
      const milestone = workplan.milestones[i];

      const currentWeek = Util.dateToWeek(new Date());

      for (let j = 0; j < milestone.tasks.length; j++) {
        const task = milestone.tasks[j];

        let dateDifference = undefined;

        if (task.newFinishDate) {
          dateDifference = task.newFinishDate.week - currentDate;
        } else if (task.finishDate) {
          dateDifference = task.finishDate.week - currentDate;
        } else {
          dateDifference = 10000;
        }

        if (task.flag === 1) {
          if (task.actualDate) {
            if (task.actualDate.week === currentWeek) {
              accomplishmentsString += `- [${task.name}] is completed.\n`;
            }
          }
        } else if (task.status === 1 && task.progress >= 0.75 && dateDifference < 2) {
          if (task.flag === 3 || task.flag === 4) {
            continue;
          }

          accomplishmentsString += `- [${task.name}] is at ${(task.progress * 100).toFixed(0)}% progress.\n`;
        }
      }
    }

    return accomplishmentsString;
  }

  generateReportRisks(workplan) {

  }

  generateReportingItems(workplan) {

    const reportingItems = [];

    let addedMilestone = false;

    for (let i = 0; i < workplan.milestones.length; i++) {
      addedMilestone = false;
      const milestone = workplan.milestones[i];

      if (milestone.flag === 0) {
        reportingItems.push(milestone);

        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];
          // NOTE: If someone wants to report a milestone. Report it in its entirety
          // if (task.target > 0 || task.flag === 0) {
          // }
          if (task.flag === 2) {
            task.name = task.name + ' (Risk)';
          }

          if (task.flag === 3 || task.flag === 4) {
            task.name = task.name + ' (Recurring)';
          }

          if (task.status !== 4) {
            reportingItems.push(task);
          }
        }

      } else if (milestone.flag === 2) {
        milestone.name = milestone.name + ' (Risk)';

        reportingItems.push(milestone);

        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          if (task.flag === 2) {
            task.name = task.name + ' (Risk)';
          }

          if (task.flag === 3 || task.flag === 4) {
            task.name = task.name + ' (Recurring)';
          }

          reportingItems.push(task);
        }

      } else {
        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          if (task.flag === 1 || task.status === 2) {

            // A task has a completed flag or is completed.
            // We need to test if it was completed recently.
            if (workplan.type === 0) {
              const tolerance = 2; // 2 Weeks since it was first completed

              const currentWeek = Util.dateToWeek(new Date(new Date().getTime() + 21600000));

              let dateDifference = -1;

              if (task.actualDate) {
                dateDifference = currentWeek - task.actualDate.week;
              } else if (task.newFinishDate) {
                dateDifference = currentWeek - task.newFinishDate.week;
              } else if (task.finishDate) {
                dateDifference = currentWeek - task.finishDate.week;
              }

              if (dateDifference >= 0 && dateDifference <= tolerance) {
                if  (!addedMilestone) {
                  reportingItems.push(milestone);
                  
                  addedMilestone = true;
                }
                
                reportingItems.push(task);
              }

            } else if (workplan.type === 1) {
              const tolerance = 10;

              const today = new Date(new Date().getTime() - 21600000);

              // console.log(today);

            } else if (workplan.type === 2) {
              const tolerance = 10;

              const today = new Date(new Date().getTime() - 21600000);
              let dateDifference = -1;

              if (task.actualDate) {
                dateDifference = today - task.actualDate.date;
                // console.log(dateDifference / 86400000, 'a');
              } else if (task.newFinishDate) {
                dateDifference = today - task.newFinishDate.date;
              } else if (task.finishDate) {
                dateDifference = today - task.finishDate.date;
              }
              dateDifference /= 86400000;

              if (dateDifference >= 0 && dateDifference <= tolerance) {
                if (!addedMilestone) {
                  reportingItems.push(milestone);

                  addedMilestone = true;
                }
                reportingItems.push(task);
              }
            }

          } else if (task.flag === 0) {
            if (!addedMilestone) {
              reportingItems.push(milestone);
              addedMilestone = true;
            }

            reportingItems.push(task);
          } else if (task.flag === 2) {
          // NOTE: Request-1 -> Add risks to the report table to track them.
            if (!addedMilestone) {
              reportingItems.push(milestone);
              addedMilestone = true;
            }

            task.name = task.name + ' (Risk)';
            
            reportingItems.push(task);
          } else if (task.flag === 3 || task.flag === 4) {

            if (!addedMilestone) {
              reportingItems.push(milestone);
              addedMilestone = true;
            }

            task.name = task.name + ' (Recurring)';
            reportingItems.push(task);
          }
        }
      }
    }

    return reportingItems;
  }

}

module.exports = { InferenceEngine };
