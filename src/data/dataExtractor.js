const { ipcMain, utilityProcess } = require('electron');
const Logger = require('../util/Logger');
const { Workplan, Milestone, Task } = require('./types');
const { Workbook, Worksheet, FormulaType } = require('exceljs');
const Util = require('../util/util');
const BridgeProvider = require('./bridgeProvider');
const { InferenceEngine } = require('./inferenceEngine');

class DataExtractor {

  /**
   * Evaluate the sheets of a Workbook to verify if any are a valid workplan given an ID
   * @param {String} projectId An ID to search inside the Workbook
   * @param {Workbook} workbook A workbook
   * @returns {(Number|{ error: string })} The sheet with the corresponding workplan or null
   */
  evaluateSheets(projectId, workbook) {

    if (!projectId) {

      Logger.Log(`No project id specified for workbook '${workbook.name}'`, 2)
    }

    let workplanScore = 0;
    let hasValidId = false;
    let sheetIndex = 0;

    let validSheetIndex = -1;

    const t0 = performance.now();

    workbook.eachSheet((worksheet) => {
      workplanScore = 0;
      hasValidId = false;
      const cells = Util.getRange(worksheet, 'A1:V10');

      const rowOffset = 22; // Calculated on the size of the range A - V = 22

      for (let i = 0; i < cells.length; i++) {
        const currentValue = `${cells[i].value}`.toLowerCase();


        if (currentValue === 'workplan' ||
          currentValue === 'project id' ||
          currentValue === 'project name' ||
          currentValue === 'project objective' ||
          currentValue === 'task' ||
          currentValue === 'responsible' ||
          currentValue === 'status' ||
          currentValue === 'progress') {
          workplanScore++;
        }

        if (currentValue === 'project id') {
          if (cells[i + rowOffset].value === projectId) {
            hasValidId = true;
          }
        }

        if (cells[i].mergedCount > 0) {
          console.log(cells[i].address);
          i += cells[i].mergedCount
        }

      }

      if (workplanScore >= 7 && hasValidId) {
        validSheetIndex = sheetIndex;
      } else if (!projectId && workplanScore >= 7) {
        validSheetIndex = sheetIndex;
      }
      sheetIndex++;
    });

    if (process.env.PERFORMANCE_METRICS === 'on') {
      const t1 = performance.now() - t0;
      Logger.Log(`Evaluated ${workbook.worksheets.length} sheets in ${t1}ms`, 0);
    }

    if (validSheetIndex === -1) {
      return {
        error: 'File does not contain a valid workplan'
      };
    }

    return workbook.worksheets[validSheetIndex];
  }

  /**
   * 
   * @param {ExcelJS.Worksheet} workplanSheet 
   */
  getWorkplanVersion(workplanSheet) {

    let version = '';

    const cells = Util.getRange(workplanSheet, 'A1:V10');

    const workplanFieldsMap = new Map();

    for (let i = 0; i < cells.length; i++) {
      if (typeof cells[i].value === 'string') {
        const workplanField = `${cells[i].value}`.toLocaleLowerCase();

        // console.log(workplanField);
        for (let j = 0; j < Util.testFields.length; j++) {
          if (workplanField === Util.testFields[j]) {
            if (workplanFieldsMap.has('remarks') && workplanField === 'remarks') {
              workplanFieldsMap.set('remarks [project]', 7);
            }

            if (!workplanFieldsMap.has(workplanField)) {
              workplanFieldsMap.set(workplanField, j);
            }
          }
        }
      }
    }

    const fieldIndices = [];

    for (let field of workplanFieldsMap.values()) {
      fieldIndices.push(field);
    }

    fieldIndices.sort((a, b) => a - b);

    let matchesV3 = 0;
    let matchesV2 = 0;
    let matchesV1_5 = 0;

    for (let i = 0; i < fieldIndices.length; i++) {

      if (Util.v3Fields.includes(fieldIndices[i])) {
        matchesV3++;
      }

      if (Util.v2Fields.includes(fieldIndices[i])) {
        matchesV2++;
      }

      if (Util.v1_5Fields.includes(fieldIndices[i])) {
        matchesV1_5++;
      }
    }

    if (fieldIndices.includes(15)) {
      matchesV3 += 2;
    }

    if (matchesV3 === Util.V3RequiredMatches) {
      version = 'v3';
    } else if (matchesV2 === Util.V2RequiredMatches) {
      version = 'v2';
    } else if (matchesV1_5 = Util.v1_5RequiredMatches) {
      version = 'v1.5';
    } else {
      version = '';
    }

    Logger.Log(`Workplan evaluated to version ${version}`, 0);

    return [version, fieldIndices];
  }

  /**
   * @param {ExcelJS.Worksheet} workplanSheet
   * @returns {number} 0 Workplan weekly, 1 Workplan Daily, 2 Workplan SCRUM
  */
  getWorkplanType(workplanVersion, workplanFields) {
    let workplanType = -1;

    const scrumFields = [28, 29, 30, 32, 33, 34, 35, 36];


    for (let i = 0; i < scrumFields.length; i++) {
      if (workplanFields.includes(scrumFields[i])) {
        workplanType = 2;
        Logger.Log(`Workplan evaluated to type ${workplanType}`, 0);
        return workplanType;
      }
    }

    if (workplanFields.includes(15)) {
      workplanType = 1;
    } else {
      workplanType = 0;
    }

    Logger.Log(`Workplan evaluated to type ${workplanType}`, 0);

    return workplanType;
  }

  /**
   * 
   * @param {Map} bridge 
   * @param {ExcelJS.Worksheet} workplanSheet 
   * @param {String} version 
   * @param {Number} type 
   * @returns 
   */
  getProjectData(bridge, workplanSheet, version, type) {

    const projectData = {};

    if (version === 'v3') {
      projectData.projectId = Util.getValueForCell(0, workplanSheet, bridge);
      projectData.projectName = Util.getValueForCell(1, workplanSheet, bridge);
      projectData.projectObjective = Util.getValueForCell(2, workplanSheet, bridge);
      projectData.projectOwner = Util.getValueForCell(3, workplanSheet, bridge);
      projectData.projectRemarks = Util.getValueForCell(7, workplanSheet, bridge);
      projectData.projectProgress = Util.getValueForCell(4, workplanSheet, bridge);

      const dateValue = Util.getValueForCell(6, workplanSheet, bridge);

      if (typeof dateValue === 'object') {
        // It is an actual date object
        const date = new Date(new Date(Util.getValueForCell(6, workplanSheet, bridge)).getTime() + 21600000);
        projectData.projectStartDate = {
          date: date,
          week: Util.dateToWeek(date)
        };
      } else {
        // It is a week number
        projectData.projectStartDate = {
          date: Util.weekToDate(Util.getValueForCell(6, workplanSheet, bridge))[0],
          week: dateValue
        };
      }

    } else if (version === 'v2') {

      projectData.projectId = Util.getValueForCell(0, workplanSheet, bridge);
      projectData.projectName = Util.getValueForCell(1, workplanSheet, bridge);
      projectData.projectObjective = Util.getValueForCell(2, workplanSheet, bridge);
      projectData.projectOwner = Util.getValueForCell(3, workplanSheet, bridge);
      projectData.projectProgress = Util.getValueForCell(4, workplanSheet, bridge);
      projectData.projectRemarks = Util.getValueForCell(7, workplanSheet, bridge);

      const dateValue = Util.getValueForCell(6, workplanSheet, bridge);

      if (typeof dateValue === 'object') {
        // It is an actual date object
        const date = new Date(new Date(Util.getValueForCell(6, workplanSheet, bridge)).getTime() + 21600000);
        projectData.projectStartDate = {
          date: date,
          week: Util.dateToWeek(date)
        };
      } else {
        // It is a week number
        projectData.projectStartDate = {
          date: Util.weekToDate(Util.getValueForCell(6, workplanSheet, bridge))[0],
          week: dateValue
        };
      }

    } else if (version === 'v1.5') {
      projectData.projectName = Util.getValueForCell(1, workplanSheet, bridge);
      projectData.projectObjective = Util.getValueForCell(2, workplanSheet, bridge);
      projectData.projectOwner = Util.getValueForCell(31, workplanSheet, bridge);
      projectData.projectProgress = Util.getValueForCell(4, workplanSheet, bridge);

      const dateValue = Util.getValueForCell(6, workplanSheet, bridge);

      if (typeof dateValue === 'object') {
        // It is an actual date object
        const date = new Date(new Date(Util.getValueForCell(6, workplanSheet, bridge)).getTime() + 21600000);
        projectData.projectStartDate = {
          date: date,
          week: Util.dateToWeek(date)
        };
      } else {
        // It is a week number
        projectData.projectStartDate = {
          date: Util.weekToDate(Util.getValueForCell(6, workplanSheet, bridge))[0],
          week: dateValue
        };
      }
    }
    Logger.Log(`Project data extracted`, 0);

    return projectData;
  }

  /**
   * 
   * @param {Object} bridge 
   * @param {ExcelJS.Worksheet} workplanSheet 
   * @param {Number} type 
   * @param {String} version 
   * @returns 
   */
  getMilestoneData(bridge, workplanSheet, type, version) {

    const milestones = [];

    if (version = 'v3') {

      const milestoneNameColumn = bridge.get(10).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneFlagColumn = bridge.get(8).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneProgressColumn = bridge.get(13).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneRemarksColumn = bridge.get(26).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCommentsColumn = bridge.get(27).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCompletedColumn = bridge.get(23).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneTargetColumn = bridge.get(24).match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneStatusColumn = bridge.get(12).match(/[a-z]+|[^a-z]+/gi)[0];

      let milestoneStartDateColumn = undefined;
      let milestoneFinishDateColumn = undefined;

      if (type === 0) {
        milestoneStartDateColumn = bridge.get(16).match(/[a-z]+|[^a-z]+/gi)[0];
        milestoneFinishDateColumn = bridge.get(18).match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        milestoneStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
        milestoneFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];
      }

      // const milestoneStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];

      workplanSheet.eachRow((row, rowNumber) => {

        const testCell = row['_cells'][0];

        if (testCell) {
          if (testCell.style.fill.pattern === 'solid') {
            if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
              const milestone = new Milestone();
              milestone.name = workplanSheet.getCell(`${milestoneNameColumn}${rowNumber}`).value;
              milestone.flag = Util.textToFlagInt(workplanSheet.getCell(`${milestoneFlagColumn}${rowNumber}`).value);

              const completedValue = workplanSheet.getCell(`${milestoneCompletedColumn}${rowNumber}`).value;

              if (completedValue) {
                if (completedValue.result) {
                  milestone.completed = completedValue.result;
                } else {
                  milestone.completed = completedValue;
                }
              } else {
                milestone.completed = 0;
              }

              const targetValue = workplanSheet.getCell(`${milestoneTargetColumn}${rowNumber}`).value;
              if (targetValue) {
                if (targetValue.result) {
                  milestone.target = targetValue.result;
                } else {
                  milestone.target = targetValue;
                }
              } else {
                milestone.target = 0;
              }

              milestone.remaining = milestone.target - milestone.completed;


              milestone.remarks = workplanSheet.getCell(`${milestoneRemarksColumn}${rowNumber}`).value;
              milestone.comments = workplanSheet.getCell(`${milestoneCommentsColumn}${rowNumber}`).value;

              milestone.row = rowNumber;

              const tasks = this.getTaskData(bridge, workplanSheet, type, version, milestone.row);
              milestone.tasks = [...tasks];
              const progressValue = workplanSheet.getCell(`${milestoneProgressColumn}${rowNumber}`).value;

              if (progressValue) {
                if (progressValue.result) {
                  milestone.progress = progressValue.result;
                } else {
                  if (!isNaN(Number.parseFloat(progressValue))) {
                    milestone.progress = Number.parseFloat(progressValue);
                  } else {
                    milestone.progress = 0;
                  }
                }
              } else {
                const progress = InferenceEngine.inferMilestoneProgress(milestone);
                milestone.progress = progress;
              }

              const startDate = InferenceEngine.inferMilestoneStartDate(milestone);
              if (startDate) {
                milestone.startDate = startDate;
              } else {
                const startDateValue = workplanSheet.getCell(`${milestoneStartDateColumn}${rowNumber}`).value;

                if (startDateValue) {
                  if (typeof startDateValue === 'object') {
                    const date = new Date(startDateValue.getTime() + 21600000);
                    milestone.startDate = {
                      date: date,
                      week: Util.dateToWeek(date)
                    };
                  } else {
                    milestone.startDate = {
                      date: Util.weekToDate(Number.parseInt(startDateValue))[0],
                      week: startDateValue
                    };
                  }
                }
              }

              const finishDate = InferenceEngine.inferMilestoneFinishDate(milestone);

              if (finishDate) {
                milestone.finishDate = finishDate;
              } else {
                const finishDateValue = workplanSheet.getCell(`${milestoneFinishDateColumn}${rowNumber}`).value;

                if (finishDateValue) {
                  if (typeof finishDateValue === 'object') {
                    if (finishDateValue.result) {
                      milestone.finishDate = {
                        date: Util.weekToDate(Number.parseInt(finishDateValue.result))[1],
                        week: finishDateValue.remaining
                      };
                    } else {
                      const date = new Date(finishDateValue.getTime() + 21600000);

                      milestone.finishDate = {
                        date: date,
                        week: Util.dateToWeek(date)
                      };
                    }
                  } else {
                    milestone.finishDate = {
                      date: Util.weekToDate(Number.parseInt(finishDateValue))[1],
                      week: finishDateValue
                    };
                  }
                }

              }

              const status = InferenceEngine.inferMilestoneStatus(milestone);

              if (status) {
                milestone.status = status;
              } else {
                milestone.status = Util.textToStatusInt(workplanSheet.getCell(`${milestoneStatusColumn}${rowNumber}`).value);
              }

              const workStatus = InferenceEngine.inferMilestoneWorkStatus(milestone, type);
              milestone.workStatus = workStatus;

              milestones.push(milestone);
            }
          }
        }
      });

    } else if (version === 'v2') {

    } else if (version === 'v1.5') {

    }

    // console.log(milestones);

    return milestones;
  }

  getTaskData(bridge, workplanSheet, type, version, startRow) {
    const tasks = [];

    if (version === 'v3') {
      const taskNumberColumn = bridge.get(9).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskNameColumn = bridge.get(10).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskFlagColumn = bridge.get(8).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskResponsibleColumn = bridge.get(11).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskStatusColumn = bridge.get(12).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskProgressColumn = bridge.get(13).match(/[a-z]+|[^a-z]+/gi)[0];

      let taskDurationColumn = undefined;

      if (bridge.get(14)) {
        taskDurationColumn = bridge.get(14).match(/[a-z]+|[^a-z]+/gi)[0];
      } else if (bridge.get(15)) {
        taskDurationColumn = bridge.get(15).match(/[a-z]+|[^a-z]+/gi)[0];
      }

      let taskStartDateColumn = undefined;
      let taskFinishDateColumn = undefined;

      if (type === 0) {
        taskStartDateColumn = bridge.get(16).match(/[a-z]+|[^a-z]+/gi)[0];
        taskFinishDateColumn = bridge.get(18).match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        taskStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
        taskFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];
      }

      const taskNewFinishDateColumn = bridge.get(20).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskActualDateColumn = bridge.get(21).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCompletedColumn = bridge.get(23).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskTargetColumn = bridge.get(24).match(/[a-z]+|[^a-z]+/gi)[0];

      const taskRemarksColumn = bridge.get(26).match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCommentsColumn = bridge.get(27).match(/[a-z]+|[^a-z]+/gi)[0];

      let i = 1;

      let taskCount = 0;

      while (workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value) {

        const testCell = workplanSheet.getCell(`${taskNameColumn}${startRow + i}`);
        if (testCell.style.fill.pattern === 'none' || testCell.style.fill.fgColor.argb === 'FFFFFFFFs') {

          const task = new Task();

          const taskNumberValue = workplanSheet.getCell(`${taskNumberColumn}${startRow + i}`).value;

          let taskNumber = undefined;

          if (taskNumberValue) {
            if (taskNumberValue.result) {
              taskNumber = taskNumberValue.result;
            } else {
              taskNumber = taskNumberValue;
            }
          }

          const taskName = `${taskNumber}. ${workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value}`;

          task.name = taskName.replace(/\n/gm, ' ');
          task.flag = Util.textToFlagInt(workplanSheet.getCell(`${taskFlagColumn}${startRow + i}`).value);
          task.responsible = workplanSheet.getCell(`${taskResponsibleColumn}${startRow + i}`).value;
          task.status = Util.textToStatusInt(workplanSheet.getCell(`${taskStatusColumn}${startRow + i}`).value);

          const progressValue = workplanSheet.getCell(`${taskProgressColumn}${startRow + i}`).value;

          if (progressValue) {
            if (progressValue.result) {
              task.progress = progressValue.result;
            } else {
              task.progress = progressValue;
            }
          } else {
            task.progress = 0;
          }

          const durationValue = workplanSheet.getCell(`${taskDurationColumn}${startRow + i}`).value;

          if (durationValue) {
            if (durationValue.result) {
              task.duration = durationValue.result;
            } else {
              task.duration = durationValue;
            }
          } else {
            task.duration = -1;
          }

          const startDateValue = workplanSheet.getCell(`${taskStartDateColumn}${startRow + i}`).value;

          if (typeof startDateValue === 'object') {
            const date = new Date(startDateValue.getTime() + 21600000);
            task.startDate = {
              date: date,
              week: Util.dateToWeek(date)
            };
          } else {
            task.startDate = {
              date: Util.weekToDate(Number.parseInt(startDateValue))[0],
              week: startDateValue
            };
          }

          const finishDateValue = workplanSheet.getCell(`${taskFinishDateColumn}${startRow + i}`).value;

          if (typeof finishDateValue === 'object') {
            if (finishDateValue.result) {
              // Its a formula
              task.finishDate = {
                date: Util.weekToDate(Number.parseInt(finishDateValue.result))[1],
                week: finishDateValue.result
              };

            } else {
              const date = new Date(finishDateValue.getTime() + 21600000);

              task.finishDate = {
                date: date,
                week: Util.dateToWeek(date)
              };
            }

          } else {
            task.finishDate = {
              date: Util.weekToDate(Number.parseInt(finishDateValue))[1],
              week: finishDateValue
            }
          }

          const newFinishDateValue = workplanSheet.getCell(`${taskNewFinishDateColumn}${startRow + i}`).value;

          if (newFinishDateValue) {
            if (typeof newFinishDateValue === 'object') {
              const date = new Date(newFinishDateValue.getTime() + 21600000);

              task.newFinishDate = {
                date: date,
                week: Util.dateToWeek(date)
              };
            } else {
              task.newFinishDate = {
                date: Util.weekToDate(Number.parseInt(newFinishDateValue))[1],
                week: newFinishDateValue
              };
            }
          }

          const actualDateValue = workplanSheet.getCell(`${taskActualDateColumn}${startRow + i}`).value;

          if (actualDateValue) {
            if (typeof actualDateValue === 'object') {
              const date = new Date(actualDateValue.getTime() + 21600000);
              task.actualDate = {
                date: date,
                week: Util.dateToWeek(date)
              };
            } else {
              task.actualDate = {
                date: Util.weekToDate(Number.parseInt(actualDateValue))[1],
                week: actualDateValue
              };
            }
          } else {
            if (task.newFinishDate) {
              task.actualDate ={
                date: task.newFinishDate.date,
                week: task.newFinishDate.week
              };
            } else {
              task.actualDate = {
                date: task.finishDate.date,
                week: task.finishDate.week
              };
            }
          }

          const completedValue = workplanSheet.getCell(`${taskCompletedColumn}${startRow + i}`).value;

          if (completedValue) {
            if (completedValue.result) {
              task.completed = completedValue.result;
            } else {
              task.completed = completedValue;
            }
          } else {
            task.completed = 0;
          }

          const targetValue = workplanSheet.getCell(`${taskTargetColumn}${startRow + i}`).value;

          if (targetValue) {
            if (targetValue.result) {
              task.target = targetValue.result;
            } else {
              task.target = targetValue;
            }
          } else {
            task.target = 0;
          }

          task.remaining = task.target - task.completed;

          task.remarks = workplanSheet.getCell(`${taskRemarksColumn}${startRow + i}`).value;
          task.comments = workplanSheet.getCell(`${taskCommentsColumn}${startRow + i}`).value;

          tasks.push(task);
        } else if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
          break;
        }

        i++;
      }
    }

    return tasks;
  }

}

module.exports = DataExtractor;
