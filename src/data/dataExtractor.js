const { ipcMain, utilityProcess, globalShortcut } = require('electron');
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

    let sheetIndex = 0;
    const rowOffset = 22;
    let validSheetIndex = -1;

    let shouldContinue = true;

    const t0 = performance.now();

    workbook.eachSheet((worksheet) => {

      if (worksheet.state !== 'visible') {
        sheetIndex++;
        return;
      }

      if (!shouldContinue) {
        return;
      }

      const cells = Util.getRange(worksheet, 'A1:V10');
      for (let i = 0; i < cells.length; i++) {
        const cellValue = cells[i].value;

        if (typeof cellValue !== 'object') {
          const currentValue = `${cellValue}`.toLocaleLowerCase();

          if (currentValue === 'project id') {

            const nextCellValue = cells[i + rowOffset].value;

            if (typeof nextCellValue !== 'object') {
              if (nextCellValue === projectId) {
                validSheetIndex = sheetIndex;
                shouldContinue = false;
              }
            }
          }

        }
      }
      sheetIndex++;
      // TODO: Review to be able to open workplans without project id

      // workplanScore = 0;
      // const fieldMap = new Map();

      // const cells = Util.getRange(worksheet, 'A1:V10');

      // for (let i = 0; i < cells.length; i++) {
      //   const cellValue = cells[i].value;

      //   if (typeof cellValue !== 'object') {
      //     const currentValue = `${cellValue}`.toLocaleLowerCase();
      //     if (!fieldMap.has(currentValue)) {
      //       fieldMap.set(currentValue, cells[i].address);
      //     }
      //   }
      // }


      // const testFields = Array.from(fieldMap.keys());

      // const testValues = ['workplan', 'project id', 'project name', 'project objective', 'task', 'responsible', 'status', 'progress'];

      // for (let i = 0; i < testValues.length; i++) {
      //   if (testFields.includes(testValues[i])) {
      //     workplanScore++;
      //   }
      // }

      // if (testFields.includes('project id')) {
      //   const sheetId = worksheet.getCell(fieldMap.get('project id'));

      //   if (sheetId === projectId) {
      //     hasValidId = true;
      //   }
      // }


      // TODO: OLD
      // console.log(workplanScore, worksheet.name);

      // workplanScore = 0;
      // hasValidId = false;
      // const cells = Util.getRange(worksheet, 'A1:V10');

      // const rowOffset = 22; // Calculated on the size of the range A - V = 22

      // for (let i = 0; i < cells.length; i++) {

      //   const cellValue = cells[i].value

      //   let currentValue = '';

      //   if (typeof cellValue !== 'object') {
      //     console.log(cellValue);
      //     currentValue = `${cells[i].value}`.toLowerCase();
      //   }



      //   if (currentValue === 'workplan' ||
      //     currentValue === 'project id' ||
      //     currentValue === 'project name' ||
      //     currentValue === 'project objective' ||
      //     currentValue === 'task' ||
      //     currentValue === 'responsible' ||
      //     currentValue === 'status' ||
      //     currentValue === 'progress') {
      //     workplanScore++;
      //   }

      //   if (currentValue === 'project id') {
      //     if (cells[i + rowOffset].value === projectId) {
      //       hasValidId = true;
      //     }
      //   }

      //   if (cells[i].mergedCount > 0) {
      //     console.log(cells[i].address);
      //     i += cells[i].mergedCount
      //   }

      // }

      // if (workplanScore >= 7 && hasValidId) {
      //   validSheetIndex = sheetIndex;
      // } else if (workplanScore >= 7) {
      //   validSheetIndex = sheetIndex;
      // }

      // if (workplanScore >= 7 && hasValidId) {
      //   validSheetIndex = sheetIndex;
      // } else if (workplanScore >= 7) {
      //   validSheetIndex = sheetIndex;
      // }

    });

    if (validSheetIndex === -1) {

    }

    if (process.env.PERFORMANCE_METRICS === 'on') {
      const t1 = performance.now() - t0;
      Logger.Log(`Evaluated ${workbook.worksheets.length} sheets in ${t1}ms`, 0);
    }

    if (validSheetIndex === -1) {
      return {
        error: `File does not contain a valid workplan ${projectId}`
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
    const workplanFieldsSet = new Set();

    for (let i = 0; i < cells.length; i++) {
      if (typeof cells[i].value === 'string') {
        const workplanField = `${cells[i].value}`.toLocaleLowerCase().trim();
        if (Util.testFields.has(workplanField)) {

          // if (workplanFieldsSet.has('remarks') && workplanField === 'remarks') {
          //   workplanFieldsSet.add('remarks [project]');
          // } else {
          //   if (!workplanFieldsSet.has(workplanField)) {
          //     workplanFieldsSet.add(workplanField);
          //   }
          // }

          if (workplanFieldsSet.has('remarks') && (workplanField === 'remarks' || workplanField === 'risk remarks')) {
            workplanFieldsSet.add('remarks [project]');
          }
          workplanFieldsSet.add(workplanField);

        }
      }
    }


    workplanFieldsSet.delete('risk remarks');

    const v4Diff1 = new Set([...workplanFieldsSet].filter(x => !Util.v4Fields.has(x))).size;
    const v3Diff1 = new Set([...workplanFieldsSet].filter(x => !Util.v3Fields.has(x))).size;

    const v4Diff2 = new Set([...Util.v4Fields].filter(x => !workplanFieldsSet.has(x))).size;
    const v3Diff2 = new Set([...Util.v3Fields].filter(x => !workplanFieldsSet.has(x))).size;

    if (v3Diff1 > 0 || v3Diff2 > 0) {
      version = 'v4';
    } else if (v4Diff1 > 0 || v4Diff2 > 0) {
      version = 'v3';
    }

    // Logger.Log('Test more workplans!!', 2);

    // if (v4Difference > v3Difference) {
    //   version = 'v3';
    // } else if (v3Difference > v4Difference) {
    //   version = 'v4';
    // } else {
    //   console.log('huh');
    // }
    // const fieldIndices = [];

    // for (let field of workplanFieldsMap.values()) {
    //   fieldIndices.push(field);
    // }

    // fieldIndices.sort((a, b) => a - b);

    // let matchesV3 = 0;
    // let matchesV2 = 0;
    // let matchesV1_5 = 0;


    // for (let i = 0; i < fieldIndices.length; i++) {

    //   if (Util.v3Fields.includes(fieldIndices[i])) {
    //     matchesV3++;
    //   }

    //   if (Util.v2Fields.includes(fieldIndices[i])) {
    //     matchesV2++;
    //   }

    //   if (Util.v1_5Fields.includes(fieldIndices[i])) {
    //     matchesV1_5++;
    //   }
    // }

    // if (fieldIndices.includes(15)) {
    //   matchesV3 += 2;
    // }

    // if (matchesV3 === Util.V3RequiredMatches) {
    //   version = 'v3';
    // } else if (matchesV2 === Util.V2RequiredMatches) {
    //   version = 'v2';
    // } else if (matchesV1_5 = Util.v1_5RequiredMatches) {
    //   version = 'v1.5';
    // } else {
    //   version = '';
    // }

    Logger.Log(`Workplan evaluated to version ${version}`, 0);
    return [version, workplanFieldsSet];
  }

  /**
   * @param {ExcelJS.Worksheet} workplanSheet
   * @returns {number} 0 Workplan weekly, 1 Workplan Daily, 2 Workplan SCRUM
  */
  getWorkplanType(workplanVersion, workplanFields) {
    let workplanType = -1;

    const scrumFields = ['sub-task', 'story points', 'description', 'estimated time', 'story', 'jira id', 'task duration (days/hours)', 'original sprint'];


    for (let i = 0; i < scrumFields.length; i++) {
      if (workplanFields.has(scrumFields[i])) {
        workplanType = 2;
        Logger.Log(`Workplan evaluated to type ${workplanType}`, 0);
        return workplanType;
      }
    }

    if (workplanFields.has('task duration (days)')) {
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
      projectData.projectId = Util.getValueForCell('project id', workplanSheet, bridge);
      projectData.projectName = Util.getValueForCell('project name', workplanSheet, bridge);
      projectData.projectObjective = Util.getValueForCell('project objective', workplanSheet, bridge);
      projectData.projectOwner = Util.getValueForCell('project owner', workplanSheet, bridge);
      projectData.projectRemarks = Util.getValueForCell('remarks [project]', workplanSheet, bridge);
      projectData.projectProgress = Util.getValueForCell('total progress', workplanSheet, bridge);

      const dateValue = Util.getValueForCell('project start date', workplanSheet, bridge);

      if (typeof dateValue === 'object') {
        // It is an actual date object
        const date = new Date(new Date(Util.getValueForCell('project start date', workplanSheet, bridge)).getTime() + 21600000);
        projectData.projectStartDate = {
          date: date,
          week: Util.dateToWeek(date)
        };
      } else {
        // It is a week number
        projectData.projectStartDate = {
          date: Util.weekToDate(Util.getValueForCell('project start date', workplanSheet, bridge))[0],
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

      const dateValue = Util.getValueForCell('project start date', workplanSheet, bridge);
      if (typeof dateValue === 'object') {
        // It is an actual date object
        const date = new Date(new Date(Util.getValueForCell('project start date', workplanSheet, bridge)).getTime() + 21600000);

        projectData.projectStartDate = {
          date: date,
          week: Util.dateToWeek(date)
        };
      } else {
        // It is a week number
        projectData.projectStartDate = {
          date: Util.weekToDate(Util.getValueForCell('project start date', workplanSheet, bridge))[0],
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
    } else if (version === 'v4') {
      projectData.projectId = Util.getValueForCell('project id', workplanSheet, bridge);
      projectData.projectName = Util.getValueForCell('project name', workplanSheet, bridge);
      projectData.projectObjective = Util.getValueForCell('project objective', workplanSheet, bridge);
      projectData.projectOwner = Util.getValueForCell('project owner', workplanSheet, bridge);
      projectData.taskCount = Util.getValueForCell('task count', workplanSheet, bridge);
      projectData.projectProgress = Util.getValueForCell('total progress', workplanSheet, bridge);
      projectData.projectRemarks = Util.getValueForCell('remarks [project]', workplanSheet, bridge);

      const dateValue = `${Util.getValueForCell('project start date', workplanSheet, bridge)}`;

      projectData.projectStartDate = {
        date: Util.getDateFromFiscalWeek(dateValue, 0),
        week: Number.parseInt(dateValue.split('.')[0])
      };

    } else {
      Logger.Log(`Not supported version ${version}`, 3);
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
  getMilestoneData(bridge, workplanSheet, type, version, projectId) {

    const milestones = [];

    if (version === 'v3') {
      const milestoneNameColumn = bridge.get('task').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneFlagColumn = bridge.get('flags').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCompletedColumn = bridge.get('completed (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneTargetColumn = bridge.get('target (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneRemarksColumn = bridge.get('remarks').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCommentsColumn = bridge.get('comments').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneProgressColumn = bridge.get('progress').match(/[a-z]+|[^a-z]+/gi)[0];

      let milestoneStartDateColumn = undefined;
      let milestoneFinishDateColumn = undefined;

      if (type === 0) {
        milestoneStartDateColumn = bridge.get('start date week').match(/[a-z]+|[^a-z]+/gi)[0];
        milestoneFinishDateColumn = bridge.get('finish date week').match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        milestoneStartDateColumn = bridge.get('start date').match(/[a-z]+|[^a-z]+/gi)[0];
        milestoneFinishDateColumn = bridge.get('finish date').match(/[a-z]+|[^a-z]+/gi)[0];
      }

      const milestoneStatusColumn = bridge.get('status').match(/[a-z]+|[^a-z]+/gi)[0];

      workplanSheet.eachRow((row, rowNumber) => {
        const testCell = row['_cells'][0];

        if (testCell) {
          if (testCell.style.fill.pattern === 'solid') {
            if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
              const milestone = new Milestone();
              milestone.name = Util.getValue(workplanSheet, `${milestoneNameColumn}${rowNumber}`, 'string');
              milestone.flag = Util.textToFlagInt(Util.getValue(workplanSheet, `${milestoneFlagColumn}${rowNumber}`, 'string'));

              milestone.completed = Util.getValue(workplanSheet, `${milestoneCompletedColumn}${rowNumber}`, 'number');
              milestone.target = Util.getValue(workplanSheet, `${milestoneTargetColumn}${rowNumber}`, 'number');

              if (milestone.target === -1) {
                milestone.target = 0;
              }

              if (milestone.completed === -1) {
                milestone.completed = 0;
              }

              milestone.remaining = milestone.target - milestone.completed;

              if (isNaN(milestone.remaining)) {
                milestone.remaining = 0;
              }

              milestone.remarks = Util.getValue(workplanSheet, `${milestoneRemarksColumn}${rowNumber}`, 'string');
              milestone.comments = Util.getValue(workplanSheet, `${milestoneCommentsColumn}${rowNumber}`, 'string');

              milestone.row = rowNumber;

              const tasks = this.getTaskData(bridge, workplanSheet, type, version, milestone.row, projectId);

              milestone.tasks = tasks;

              const progress = Util.getValue(workplanSheet, `${milestoneProgressColumn}${rowNumber}`, 'number');

              if (progress > 0) {
                milestone.progress = progress;
              } else {
                milestone.progress = InferenceEngine.inferMilestoneProgress(milestone);
              }

              const startDate = InferenceEngine.inferMilestoneStartDate(milestone);

              if (startDate) {
                milestone.startDate = startDate;
              } else {
                let date = undefined;
                if (type === 0) {
                  date = Util.getValue(workplanSheet, `${milestoneStartDateColumn}${rowNumber}`, 'number');
                  if (date !== -1) {
                    milestone.startDate = {
                      date: Util.weekToDate(date)[0],
                      week: date
                    };
                  }

                } else {
                  date = Util.getValue(workplanSheet, `${milestoneStartDateColumn}${rowNumber}`, 'date');
                  if (date) {
                    milestone.startDate = {
                      date: new Date(date.getTime() + 21600000),
                      week: Util.dateToWeek(new Date(date.getTime() + 21600000))
                    };
                  }
                }
              }

              const finishDate = InferenceEngine.inferMilestoneFinishDate(milestone);

              if (finishDate) {
                milestone.finishDate = finishDate;
              } else {
                let date = undefined;

                if (type === 0) {
                  date = Util.getValue(workplanSheet, `${milestoneFinishDateColumn}${rowNumber}`, 'number');
                  if (date !== -1) {
                    milestone.finishDate = {
                      date: Util.weekToDate(date)[1],
                      week: date
                    };
                  }
                } else {
                  date = Util.getValue(workplanSheet, `${milestoneFinishDateColumn}${rowNumber}`, 'date');
                  if (date) {
                    milestone.finishDate = {
                      date: new Date(date.getTime() + 21600000),
                      week: Util.dateToWeek(new Date(date.getTime() + 21600000))
                    };
                  }
                }
              }

              const status = InferenceEngine.inferMilestoneStatus(milestone);

              if (status) {
                milestone.status = status;
              } else {
                milestone.status = Util.textToStatusInt(Util.getValue(workplanSheet, `${milestoneStatusColumn}${rowNumber}`, 'string'));
              }

              milestone.workStatus = InferenceEngine.inferMilestoneWorkStatus(milestone, type, version);

              // console.log(milestone);
              milestones.push(milestone);
            }
          }
        }
      });

      // const milestoneNameColumn = bridge.get(10).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneFlagColumn = bridge.get(8).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneProgressColumn = bridge.get(13).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneRemarksColumn = bridge.get(26).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneCommentsColumn = bridge.get(27).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneCompletedColumn = bridge.get(23).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneTargetColumn = bridge.get(24).match(/[a-z]+|[^a-z]+/gi)[0];
      // const milestoneStatusColumn = bridge.get(12).match(/[a-z]+|[^a-z]+/gi)[0];

      // let milestoneStartDateColumn = undefined;
      // let milestoneFinishDateColumn = undefined;

      // if (type === 0) {
      //   milestoneStartDateColumn = bridge.get(16).match(/[a-z]+|[^a-z]+/gi)[0];
      //   milestoneFinishDateColumn = bridge.get(18).match(/[a-z]+|[^a-z]+/gi)[0];
      // } else {
      //   milestoneStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
      //   milestoneFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];
      // }

      // // const milestoneStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
      // // const milestoneFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];

      // workplanSheet.eachRow((row, rowNumber) => {

      //   const testCell = row['_cells'][0];

      //   if (testCell) {
      //     if (testCell.style.fill.pattern === 'solid') {
      //       if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
      //         const milestone = new Milestone();
      //         milestone.name = workplanSheet.getCell(`${milestoneNameColumn}${rowNumber}`).value;
      //         milestone.flag = Util.textToFlagInt(workplanSheet.getCell(`${milestoneFlagColumn}${rowNumber}`).value);

      //         const completedValue = workplanSheet.getCell(`${milestoneCompletedColumn}${rowNumber}`).value;

      //         if (completedValue) {
      //           if (completedValue.result) {
      //             milestone.completed = completedValue.result;
      //           } else {
      //             milestone.completed = completedValue;
      //           }
      //         } else {
      //           milestone.completed = 0;
      //         }

      //         const targetValue = workplanSheet.getCell(`${milestoneTargetColumn}${rowNumber}`).value;
      //         if (targetValue) {
      //           if (targetValue.result) {
      //             milestone.target = targetValue.result;
      //           } else {
      //             milestone.target = targetValue;
      //           }
      //         } else {
      //           milestone.target = 0;
      //         }

      //         milestone.remaining = milestone.target - milestone.completed;


      //         milestone.remarks = workplanSheet.getCell(`${milestoneRemarksColumn}${rowNumber}`).value;
      //         milestone.comments = workplanSheet.getCell(`${milestoneCommentsColumn}${rowNumber}`).value;

      //         milestone.row = rowNumber;

      //         const tasks = this.getTaskData(bridge, workplanSheet, type, version, milestone.row);
      //         milestone.tasks = [...tasks];
      //         const progressValue = workplanSheet.getCell(`${milestoneProgressColumn}${rowNumber}`).value;

      //         if (progressValue) {
      //           if (progressValue.result) {
      //             milestone.progress = progressValue.result;
      //           } else {
      //             if (!isNaN(Number.parseFloat(progressValue))) {
      //               milestone.progress = Number.parseFloat(progressValue);
      //             } else {
      //               milestone.progress = 0;
      //             }
      //           }
      //         } else {
      //           const progress = InferenceEngine.inferMilestoneProgress(milestone);
      //           milestone.progress = progress;
      //         }

      //         const startDate = InferenceEngine.inferMilestoneStartDate(milestone);
      //         if (startDate) {
      //           milestone.startDate = startDate;
      //         } else {
      //           const startDateValue = workplanSheet.getCell(`${milestoneStartDateColumn}${rowNumber}`).value;

      //           if (startDateValue) {
      //             if (typeof startDateValue === 'object') {
      //               const date = new Date(startDateValue.getTime() + 21600000);
      //               milestone.startDate = {
      //                 date: date,
      //                 week: Util.dateToWeek(date)
      //               };
      //             } else {
      //               milestone.startDate = {
      //                 date: Util.weekToDate(Number.parseInt(startDateValue))[0],
      //                 week: startDateValue
      //               };
      //             }
      //           }
      //         }

      //         const finishDate = InferenceEngine.inferMilestoneFinishDate(milestone);

      //         if (finishDate) {
      //           milestone.finishDate = finishDate;
      //         } else {
      //           const finishDateValue = workplanSheet.getCell(`${milestoneFinishDateColumn}${rowNumber}`).value;

      //           if (finishDateValue) {
      //             if (typeof finishDateValue === 'object') {
      //               if (finishDateValue.result) {
      //                 milestone.finishDate = {
      //                   date: Util.weekToDate(Number.parseInt(finishDateValue.result))[1],
      //                   week: finishDateValue.remaining
      //                 };
      //               } else {
      //                 const date = new Date(finishDateValue.getTime() + 21600000);

      //                 milestone.finishDate = {
      //                   date: date,
      //                   week: Util.dateToWeek(date)
      //                 };
      //               }
      //             } else {
      //               milestone.finishDate = {
      //                 date: Util.weekToDate(Number.parseInt(finishDateValue))[1],
      //                 week: finishDateValue
      //               };
      //             }
      //           }

      //         }

      //         const status = InferenceEngine.inferMilestoneStatus(milestone);

      //         if (status) {
      //           milestone.status = status;
      //         } else {
      //           milestone.status = Util.textToStatusInt(workplanSheet.getCell(`${milestoneStatusColumn}${rowNumber}`).value);
      //         }

      //         const workStatus = InferenceEngine.inferMilestoneWorkStatus(milestone, type);
      //         milestone.workStatus = workStatus;

      //         milestones.push(milestone);
      //       }
      //     }
      //   }
      // });

    } else if (version === 'v2') {

    } else if (version === 'v1.5') {

    } else if (version === 'v4') {
      const milestoneNameColumn = bridge.get('task').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneFlagColumn = bridge.get('flags').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCompletedColumn = bridge.get('completed (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneTargetColumn = bridge.get('target (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneRemarksColumn = bridge.get('remarks').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneCommentsColumn = bridge.get('comments').match(/[a-z]+|[^a-z]+/gi)[0];
      const milestoneProgressColumn = bridge.get('progress').match(/[a-z]+|[^a-z]+/gi)[0];

      let milestoneStartDateColumn = undefined;
      let milestoneFinishDateColumn = undefined;

      if (type === 0) {
        milestoneStartDateColumn = bridge.get('start date week').match(/[a-z]+|[^a-z]+/gi)[0];
        milestoneFinishDateColumn = bridge.get('finish date week').match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        Logger.Log('Not managed: Milestone data', 3);
      }
      const milestoneStatusColumn = bridge.get('status').match(/[a-z]+|[^a-z]+/gi)[0];
      const index = Util.getColumnIndexByLetter(milestoneNameColumn);
      workplanSheet.eachRow((row, rowNumber) => {
        // TODO: Should probably get the cell for 
       

        const testCell = row['_cells'][index];
        if (testCell) {
          // console.log(testCell.style, testCell.address);
          if (testCell.style.fill) {
            if (testCell.style.fill.pattern === 'solid') {
              // console.log(testCell.style.fill, testCell.address);

              if ((testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
                const milestone = new Milestone();

                milestone.name = Util.getValue(workplanSheet, `${milestoneNameColumn}${rowNumber}`, 'string');
                milestone.flag = Util.textToFlagInt(Util.getValue(workplanSheet, `${milestoneFlagColumn}${rowNumber}`, 'string'));

                milestone.completed = Util.getValue(workplanSheet, `${milestoneCompletedColumn}${rowNumber}`, 'number');
                milestone.target = Util.getValue(workplanSheet, `${milestoneTargetColumn}${rowNumber}`, 'number');

                if (milestone.target === -1) {
                  milestone.target = 0;
                }

                if (milestone.completed === -1) {
                  milestone.completed = 0;
                }

                milestone.remaining = milestone.target - milestone.completed;

                if (isNaN(milestone.remaining)) {
                  milestone.remaining = 0;
                }

                milestone.remarks = Util.getValue(workplanSheet, `${milestoneRemarksColumn}${rowNumber}`, 'string');
                milestone.comments = Util.getValue(workplanSheet, `${milestoneCommentsColumn}${rowNumber}`, 'string');
                milestone.row = rowNumber;

                const tasks = this.getTaskData(bridge, workplanSheet, type, version, milestone.row);

                milestone.tasks = tasks;

                const progress = Util.getValue(workplanSheet, `${milestoneProgressColumn}${rowNumber}`, 'number');
                if (progress > 0) {
                  milestone.progress = progress;
                } else {
                  milestone.progress = InferenceEngine.inferMilestoneProgress(milestone);
                }

                const startDate = InferenceEngine.inferMilestoneStartDate(milestone);

                if (startDate) {
                  milestone.startDate = startDate;
                } else {
                  if (type === 0) {
                    const date = Util.getValue(workplanSheet, `${milestoneStartDateColumn}${rowNumber}`, 'number');

                    if (date !== -1) {
                      milestone.startDate = {
                        // TODO: Fill this!!
                      };
                    }
                  }
                }

                const finishDate = InferenceEngine.inferMilestoneFinishDate(milestone);

                if (finishDate) {
                  milestone.finishDate = finishDate;
                } else {
                  if (type === 0) {
                    const date = Util.getValue(workplanSheet, `${milestoneFinishDateColumn}${rowNumber}`, 'number');

                    if (date !== -1) {
                      milestone.finishDate = {
                        // TODO: Fill this!!
                      }
                    }
                  }
                }

                const status = InferenceEngine.inferMilestoneStatus(milestone);

                if (status) {
                  milestone.status = status;
                } else {
                  milestone.status = Util.textToStatusInt(Util.getValue(workplanSheet, `${milestoneStatusColumn}${rowNumber}`, 'string'));
                }

                milestone.workStatus = InferenceEngine.inferMilestoneWorkStatus(milestone, type, version);

                milestones.push(milestone);
              }

            }
          }
        }
      });
    }

    return milestones;
  }

  // getTaskData(bridge, workplanSheet, type, version, startRow) {
  //   const tasks = [];

  //   if (version === 'v3') {
  //     const taskNumberColumn = bridge.get(9).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskNameColumn = bridge.get(10).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskFlagColumn = bridge.get(8).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskResponsibleColumn = bridge.get(11).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskStatusColumn = bridge.get(12).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskProgressColumn = bridge.get(13).match(/[a-z]+|[^a-z]+/gi)[0];

  //     let taskDurationColumn = undefined;

  //     if (bridge.get(14)) {
  //       taskDurationColumn = bridge.get(14).match(/[a-z]+|[^a-z]+/gi)[0];
  //     } else if (bridge.get(15)) {
  //       taskDurationColumn = bridge.get(15).match(/[a-z]+|[^a-z]+/gi)[0];
  //     }

  //     let taskStartDateColumn = undefined;
  //     let taskFinishDateColumn = undefined;

  //     if (type === 0) {
  //       taskStartDateColumn = bridge.get(16).match(/[a-z]+|[^a-z]+/gi)[0];
  //       taskFinishDateColumn = bridge.get(18).match(/[a-z]+|[^a-z]+/gi)[0];
  //     } else {
  //       taskStartDateColumn = bridge.get(17).match(/[a-z]+|[^a-z]+/gi)[0];
  //       taskFinishDateColumn = bridge.get(19).match(/[a-z]+|[^a-z]+/gi)[0];
  //     }

  //     const taskNewFinishDateColumn = bridge.get(20).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskActualDateColumn = bridge.get(21).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskCompletedColumn = bridge.get(23).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskTargetColumn = bridge.get(24).match(/[a-z]+|[^a-z]+/gi)[0];

  //     const taskRemarksColumn = bridge.get(26).match(/[a-z]+|[^a-z]+/gi)[0];
  //     const taskCommentsColumn = bridge.get(27).match(/[a-z]+|[^a-z]+/gi)[0];

  //     let i = 1;

  //     let taskCount = 0;

  //     while (workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value) {

  //       const testCell = workplanSheet.getCell(`${taskNameColumn}${startRow + i}`);
  //       if (testCell.style.fill.pattern === 'none' || testCell.style.fill.fgColor.argb === 'FFFFFFFFs') {

  //         const task = new Task();

  //         const taskNumberValue = workplanSheet.getCell(`${taskNumberColumn}${startRow + i}`).value;

  //         let taskNumber = undefined;

  //         if (taskNumberValue) {
  //           if (taskNumberValue.result) {
  //             taskNumber = taskNumberValue.result;
  //           } else {
  //             taskNumber = taskNumberValue;
  //           }
  //         }

  //         const taskName = `${taskNumber}. ${workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value}`;

  //         task.name = taskName.replace(/\n/gm, ' ');
  //         task.flag = Util.textToFlagInt(workplanSheet.getCell(`${taskFlagColumn}${startRow + i}`).value);
  //         task.responsible = workplanSheet.getCell(`${taskResponsibleColumn}${startRow + i}`).value;
  //         task.status = Util.textToStatusInt(workplanSheet.getCell(`${taskStatusColumn}${startRow + i}`).value);

  //         const progressValue = workplanSheet.getCell(`${taskProgressColumn}${startRow + i}`).value;

  //         if (progressValue) {
  //           if (progressValue.result) {
  //             task.progress = progressValue.result;
  //           } else {
  //             task.progress = progressValue;
  //           }
  //         } else {
  //           task.progress = 0;
  //         }

  //         const durationValue = workplanSheet.getCell(`${taskDurationColumn}${startRow + i}`).value;

  //         if (durationValue) {
  //           if (durationValue.result) {
  //             task.duration = durationValue.result;
  //           } else {
  //             task.duration = durationValue;
  //           }
  //         } else {
  //           task.duration = -1;
  //         }

  //         const startDateValue = workplanSheet.getCell(`${taskStartDateColumn}${startRow + i}`).value;

  //         if (startDateValue) {
  //           if (typeof startDateValue === 'object') {
  //             const date = new Date(startDateValue.getTime() + 21600000);
  //             task.startDate = {
  //               date: date,
  //               week: Util.dateToWeek(date)
  //             };
  //           } else {
  //             task.startDate = {
  //               date: Util.weekToDate(Number.parseInt(startDateValue))[0],
  //               week: startDateValue
  //             };
  //           }
  //         } else {
  //           task.startDate = undefined;
  //         }

  //         const finishDateValue = workplanSheet.getCell(`${taskFinishDateColumn}${startRow + i}`).value;
  //         console.log(finishDateValue);
  //         if (finishDateValue) {
  //           if (typeof finishDateValue === 'object') {
  //             if (finishDateValue.result) {
  //               // Its a formula
  //               task.finishDate = {
  //                 date: Util.weekToDate(Number.parseInt(finishDateValue.result))[1],
  //                 week: finishDateValue.result
  //               };

  //             } else {
  //               const date = new Date(finishDateValue.getTime() + 21600000);

  //               task.finishDate = {
  //                 date: date,
  //                 week: Util.dateToWeek(date)
  //               };
  //             }

  //           } else {
  //             task.finishDate = {
  //               date: Util.weekToDate(Number.parseInt(finishDateValue))[1],
  //               week: finishDateValue
  //             }
  //           }
  //         } else {
  //           task.finishDate = undefined;
  //         }

  //         const newFinishDateValue = workplanSheet.getCell(`${taskNewFinishDateColumn}${startRow + i}`).value;

  //         if (newFinishDateValue) {
  //           if (typeof newFinishDateValue === 'object') {
  //             const date = new Date(newFinishDateValue.getTime() + 21600000);

  //             task.newFinishDate = {
  //               date: date,
  //               week: Util.dateToWeek(date)
  //             };
  //           } else {
  //             task.newFinishDate = {
  //               date: Util.weekToDate(Number.parseInt(newFinishDateValue))[1],
  //               week: newFinishDateValue
  //             };
  //           }
  //         }

  //         const actualDateValue = workplanSheet.getCell(`${taskActualDateColumn}${startRow + i}`).value;

  //         if (actualDateValue) {
  //           if (typeof actualDateValue === 'object') {
  //             const date = new Date(actualDateValue.getTime() + 21600000);
  //             task.actualDate = {
  //               date: date,
  //               week: Util.dateToWeek(date)
  //             };
  //           } else {
  //             task.actualDate = {
  //               date: Util.weekToDate(Number.parseInt(actualDateValue))[1],
  //               week: actualDateValue
  //             };
  //           }
  //         } else {
  //           if (task.newFinishDate) {
  //             task.actualDate ={
  //               date: task.newFinishDate.date,
  //               week: task.newFinishDate.week
  //             };
  //           } else {
  //             task.actualDate = {
  //               date: task.finishDate.date,
  //               week: task.finishDate.week
  //             };
  //           }
  //         }

  //         const completedValue = workplanSheet.getCell(`${taskCompletedColumn}${startRow + i}`).value;

  //         if (completedValue) {
  //           if (completedValue.result) {
  //             task.completed = completedValue.result;
  //           } else {
  //             task.completed = completedValue;
  //           }
  //         } else {
  //           task.completed = 0;
  //         }

  //         const targetValue = workplanSheet.getCell(`${taskTargetColumn}${startRow + i}`).value;

  //         if (targetValue) {
  //           if (targetValue.result) {
  //             task.target = targetValue.result;
  //           } else {
  //             task.target = targetValue;
  //           }
  //         } else {
  //           task.target = 0;
  //         }

  //         task.remaining = task.target - task.completed;

  //         task.remarks = workplanSheet.getCell(`${taskRemarksColumn}${startRow + i}`).value;
  //         task.comments = workplanSheet.getCell(`${taskCommentsColumn}${startRow + i}`).value;

  //         tasks.push(task);
  //       } else if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
  //         break;
  //       }

  //       i++;
  //     }
  //   }

  //   return tasks;
  // }

  getTaskData(bridge, workplanSheet, type, version, startRow, projectId) {
    const tasks = [];

    if (version === 'v3') {
      const taskNumberColumn = bridge.get('#').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskNameColumn = bridge.get('task').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskFlagColumn = bridge.get('flags').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskResponsibleColumn = bridge.get('responsible').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskStatusColumn = bridge.get('status').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskProgressColumn = bridge.get('progress').match(/[a-z]+|[^a-z]+/gi)[0];


      let taskDurationColumn = undefined
      let taskStartDateColumn = undefined;
      let taskFinishDateColumn = undefined;

      if (type === 0) {
        taskDurationColumn = bridge.get('task duration (weeks)').match(/[a-z]+|[^a-z]+/gi)[0];
        taskStartDateColumn = bridge.get('start date week').match(/[a-z]+|[^a-z]+/gi)[0];
        taskFinishDateColumn = bridge.get('finish date week').match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        taskDurationColumn = bridge.get('task duration (days)').match(/[a-z]+|[^a-z]+/gi)[0];
        taskStartDateColumn = bridge.get('start date').match(/[a-z]+|[^a-z]+/gi)[0];
        taskFinishDateColumn = bridge.get('finish date').match(/[a-z]+|[^a-z]+/gi)[0];
      }

      const taskNewFinishDateColumn = bridge.get('new finish date').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskActualDateColumn = bridge.get('actual date').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCompletedColumn = bridge.get('completed (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskTargetColumn = bridge.get('target (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];

      const taskRemarksColumn = bridge.get('remarks').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCommentsColumn = bridge.get('comments').match(/[a-z]+|[^a-z]+/gi)[0];

      let i = 1;
      let taskCount = 0;

      while (workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value) {
        const testCell = workplanSheet.getCell(`${taskNameColumn}${startRow + i}`);

        if (testCell.style.fill.pattern === 'none' || testCell.style.fill.fgColor.argb === 'FFFFFFFF') {
          const task = new Task();

          const taskNumber = Util.getValue(workplanSheet, `${taskNumberColumn}${startRow + i}`, 'string');
          task.name = taskNumber + '. ' + Util.getValue(workplanSheet, `${taskNameColumn}${startRow + i}`, 'string');

          task.flag = Util.textToFlagInt(Util.getValue(workplanSheet, `${taskFlagColumn}${startRow + i}`, 'string'));
          task.responsible = Util.getValue(workplanSheet, `${taskResponsibleColumn}${startRow + i}`, 'string');
          task.status = Util.textToStatusInt(Util.getValue(workplanSheet, `${taskStatusColumn}${startRow + i}`, 'string'));

          const progress = Util.getValue(workplanSheet, `${taskProgressColumn}${startRow + i}`, 'number');

          if (progress >= 0) {
            task.progress = progress;
          } else {
            task.progress = 0;
          }

          task.duration = Util.getValue(workplanSheet, `${taskDurationColumn}${startRow + i}`, 'number');

          let startDate = undefined;

          if (type === 0) {
            startDate = Util.getValue(workplanSheet, `${taskStartDateColumn}${startRow + i}`, 'number');
            if (startDate !== -1) {
              task.startDate = {
                date: Util.weekToDate(startDate)[0],
                week: startDate
              };
            }
          } else {
            startDate = Util.getValue(workplanSheet, `${taskStartDateColumn}${startRow + i}`, 'date');

            if (startDate) {
              task.startDate = {
                date: new Date(startDate.getTime() + 21600000),
                week: Util.dateToWeek(new Date(startDate.getTime() + 21600000))
              };
            }
          }

          let finishDate = undefined;

          if (type === 0) {
            finishDate = Util.getValue(workplanSheet, `${taskFinishDateColumn}${startRow + i}`, 'number');

            if (finishDate !== -1) {
              task.finishDate = {
                date: Util.weekToDate(finishDate)[1],
                week: finishDate
              };
            }
          } else {
            finishDate = Util.getValue(workplanSheet, `${taskFinishDateColumn}${startRow + i}`, 'date');
            if (finishDate) {
              task.finishDate = {
                date: new Date(finishDate.getTime() + 21600000),
                week: Util.dateToWeek(new Date(finishDate.getTime() + 21600000))
              };
            }
          }

          let newFinishDate = undefined;

          if (type === 0) {
            newFinishDate = Util.getValue(workplanSheet, `${taskNewFinishDateColumn}${startRow + i}`, 'number');
            if (newFinishDate !== -1) {
              task.newFinishDate = {
                date: Util.weekToDate(newFinishDate)[1],
                week: newFinishDate
              };
            }
          } else {
            newFinishDate = Util.getValue(workplanSheet, `${taskNewFinishDateColumn}${startRow + i}`, 'date');
            if (newFinishDate) {
              task.newFinishDate = {
                date: new Date(newFinishDate.getTime() + 21600000),
                week: Util.dateToWeek(new Date(newFinishDate.getTime() + 21600000))
              };
            }
          }

          let actualDate = undefined;

          if (type === 0) {
            actualDate = Util.getValue(workplanSheet, `${taskActualDateColumn}${startRow + i}`, 'number');
            if (actualDate !== -1) {
              task.actualDate = {
                date: Util.weekToDate(actualDate)[1],
                week: actualDate
              };
            }
          } else {
            actualDate = Util.getValue(workplanSheet, `${taskActualDateColumn}${startRow + i}`, 'date');
            if (actualDate) {
              task.actualDate = {
                date: new Date(actualDate.getTime() + 21600000),
                week: Util.dateToWeek(new Date(actualDate.getTime() + 21600000))
              };
            }
          }

          task.completed = Util.getValue(workplanSheet, `${taskCompletedColumn}${startRow + i}`, 'number');
          task.target = Util.getValue(workplanSheet, `${taskTargetColumn}${startRow + i}`, 'number');

          if (task.completed === -1) {
            task.completed = 0;
          }

          if (task.target === -1) {
            task.target = 0;
          }

          task.remaining = task.target - task.completed;

          if (projectId === 'TR-1') {
            const workedLastWeekColumn = bridge.get('worked last week').match(/[a-z]+|[^a-z]+/gi)[0];
            const workedLastWeek = Util.getValue(workplanSheet, `${workedLastWeekColumn}${startRow + i}`, 'number');

            const receivedLastWeekColumn = bridge.get('received last week').match(/[a-z]+|[^a-z]+/gi)[0];
            const receivedLastWeek = Util.getValue(workplanSheet, `${receivedLastWeekColumn}${startRow + i}`, 'number');

            task.workedLastWeek = workedLastWeek;
            task.receivedLastWeek = receivedLastWeek;
          }

          task.remarks = Util.getValue(workplanSheet, `${taskRemarksColumn}${startRow + i}`, 'string');
          task.comments = Util.getValue(workplanSheet, `${taskCommentsColumn}${startRow + i}`, 'string');


          task.workStatus = InferenceEngine.inferTaskWorkStatus(task, type, version);

          tasks.push(task);
        } else if ((testCell.style.fill.fgColor.theme === 3 && testCell.style.fill.fgColor.tint === 0.7999816888943144) || (testCell.style.fill.fgColor.argb === 'FFD6DCE4')) {
          break;
        }
        i++;
      }
    } else if (version === 'v4') {
      const taskNumberColumn = bridge.get('#').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskNameColumn = bridge.get('task').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskFlagColumn = bridge.get('flags').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskResponsibleColumn = bridge.get('responsible').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskStatusColumn = bridge.get('status').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskProgressColumn = bridge.get('progress').match(/[a-z]+|[^a-z]+/gi)[0];

      let taskDurationColumn = undefined;
      let taskStartDateColumn = undefined;
      let taskFinishDateColumn = undefined;

      if (type === 0) {
        taskDurationColumn = bridge.get('task duration (weeks)').match(/[a-z]+|[^a-z]+/gi)[0];
        taskStartDateColumn = bridge.get('start date week').match(/[a-z]+|[^a-z]+/gi)[0];
        taskFinishDateColumn = bridge.get('finish date week').match(/[a-z]+|[^a-z]+/gi)[0];
      } else {
        Logger.Log('Not supported haha', 3);
      }

      const taskNewFinishDateColumn = bridge.get('new finish date').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskActualDateColumn = bridge.get('actual date').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCompletedColumn = bridge.get('completed (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskTargetColumn = bridge.get('target (if applicable)').match(/[a-z]+|[^a-z]+/gi)[0];

      const taskRemarksColumn = bridge.get('remarks').match(/[a-z]+|[^a-z]+/gi)[0];
      const taskCommentsColumn = bridge.get('comments').match(/[a-z]+|[^a-z]+/gi)[0];

      let i = 1;
      while (workplanSheet.getCell(`${taskNameColumn}${startRow + i}`).value) {
        const testCell = workplanSheet.getCell(`${taskNameColumn}${startRow + i}`);
        if (testCell.style.fill.pattern === 'none' || testCell.style.fill.fgColor.argb === 'FFFFFFFF') {
          const task = new Task();

          const taskNumber = Util.getValue(workplanSheet, `${taskNumberColumn}${startRow + i}`, 'string');
          task.name = taskNumber + '. ' + Util.getValue(workplanSheet, `${taskNameColumn}${startRow + i}`, 'string');

          task.flag = Util.textToFlagInt(Util.getValue(workplanSheet, `${taskFlagColumn}${startRow + i}`, 'string'));
          task.responsible = Util.getValue(workplanSheet, `${taskResponsibleColumn}${startRow + i}`, 'string');
          task.status = Util.textToStatusInt(Util.getValue(workplanSheet, `${taskStatusColumn}${startRow + i}`, 'string'));

          const progress = Util.getValue(workplanSheet, `${taskProgressColumn}${startRow + i}`, 'number');

          if (progress > 0) {
            task.progress = progress;
          } else {
            task.progress = 0;
          }

          task.duration = Util.getValue(workplanSheet, `${taskDurationColumn}${startRow + i}`, 'number');

          let startDate = undefined;

          if (type === 0) {
            startDate = `${Util.getValue(workplanSheet, `${taskStartDateColumn}${startRow + i}`, 'number').toFixed(2)}`;
            if (startDate !== '-1.00') {
              task.startDate = {
                date: Util.getDateFromFiscalWeek(startDate, 0),
                week: Number.parseInt(startDate.split('.')[0])
              };
            }
          }


          let finishDate = undefined;

          if (type === 0) {
            finishDate = `${Util.getValue(workplanSheet, `${taskFinishDateColumn}${startRow + i}`, 'number').toFixed(2)}`;
            if (finishDate !== '-1.00') {
              task.finishDate = {
                date: Util.getDateFromFiscalWeek(finishDate, 1),
                week: Number.parseInt(finishDate.split('.')[0])
              };
            }
          }


          let newFinishDate = undefined;

          if (type === 0) {
            newFinishDate = `${Util.getValue(workplanSheet, `${taskNewFinishDateColumn}${startRow + i}`, 'number').toFixed(2)}`;

            if (newFinishDate !== '-1.00') {
              task.newFinishDate = {
                date: Util.getDateFromFiscalWeek(newFinishDate, 1),
                week: Number.parseInt(newFinishDate.split('.')[1])
              };
            }
          }

          let actualDate = undefined;

          if (type === 0) {
            actualDate = `${Util.getValue(workplanSheet, `${taskActualDateColumn}${startRow + i}`, 'number').toFixed(2)}`;
            if (actualDate !== '-1.00') {
              task.actualDate = {
                date: Util.getDateFromFiscalWeek(actualDate, 1),
                week: Number.parseInt(actualDate.split('.')[1])
              };
            }
          }

          task.completed = Util.getValue(workplanSheet, `${taskCompletedColumn}${startRow + i}`, 'number');
          task.target = Util.getValue(workplanSheet, `${taskTargetColumn}${startRow + i}`, 'number');

          if (task.completed === -1) {
            task.completed = 0;
          }

          if (task.target === -1) {
            task.target = 0;
          }

          task.remaining = task.target - task.completed;

          if (projectId === 'TR-1') {
            console.log('weird scenario');
          }

          task.remarks = Util.getValue(workplanSheet, `${taskRemarksColumn}${startRow + i}`, 'string');
          task.comments = Util.getValue(workplanSheet, `${taskCommentsColumn}${startRow + i}`, 'string');

          task.workStatus = InferenceEngine.inferTaskWorkStatus(task, type, version);
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
