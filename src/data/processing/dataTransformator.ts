/* 
  Raymundo Paz
  March 2024
*/

import { customIsDate, getDateFromFiscal, getFiscalWeek, getFiscalYear, isWorkplan, nPlusColumn, workplanFields } from '../../util/util';
import { PerformanceMeter } from '../../util/performanceMeter';
import { CustomWorksheet, CustomCell, Milestone, Task, Workplan } from '../data';
import { Duration, Flag, Label, Status, WPDate, WorkplanBridge, WorkplanBridgeValue, WorkplanField } from '../../util/misc';
import { LogType, Logger } from '../../util/logger';

export class DataTransformator {

  public sheetToWorkplan(inputSheet: CustomWorksheet): void {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    // 1. Create a mapping Cell(s) -> Field
    // 1.1 Iterate over all the cells in the default testing range
    // 1.2 For each cell, iterate over all fields
    // 1.3 For each cell - field combination check if the field has any aliases.
    // If it does
    // Iterate over all aliases and check if the cell value is equal to the alias value. If so we have a match and can break out of the loops.
    // If it does not
    // Then we check if the cell value is equal to 'Remarks'
    // If it is
    // If there is a 'projectRemarks' field inside the bridge (Map) that field is equal to 'remarks'
    // If there is not, that field is 'projectRemarks'
    // If it is not
    // We check if the cell value is equal to the name field and if is, we have a match and can break out of the loop.
    // 2. Check that the workplan has all required fields
    // 3. Get workplan-level fields
    // 4. Get activity information. (Activity = [Miletsone | Task | Subtask]) (Preferrably in one pass)
    //

    const bridge = this.provideWorkplanBridge(inputSheet);

    if (!this.bridgeHasRequiredFields(bridge)) {
      Logger.log('Not all required fields', LogType.ERROR);
      return;
    }

    const workplan = new Workplan();

    this.getRequiredFields(workplan, bridge, inputSheet);
    this.generateActivities(workplan, bridge, inputSheet);



    // const bridge: WorkplanBridge = new Map();

    // let dateAndDurationFormat = -1;

    // for (let i = 0; i < inputSheet.cells.length; i++) {
    //   const cell = inputSheet.cells[i];
    //   const cellValue = `${cell.value}`.toLocaleLowerCase();

    //   for (let j = 0; j < workplanFields.length; j++) {
    //     const field = workplanFields[j];

    //     if (field.aliases.length > 0) {
    //       for (let k = 0; k < field.aliases.length; k++) {
    //         const alias = field.aliases[k];

    //         if (cellValue === alias.toLocaleLowerCase()) {
    //           bridge.set(field.name, { cell: cell, field: field });
    //         }
    //       }

    //       if (field.aliases.includes(`${cell.value}`)) {

    //         if (field.name === 'duration') {
    //           if (cell.value.toString().includes('Weeks')) {
    //             dateAndDurationFormat = 0;
    //           } else {
    //             dateAndDurationFormat = 1;
    //           }
    //         }
    //         // TODO: Manage cases per type of field 
    //         // console.log(field, cell.value);

    //         // switch (field.name) {
    //         //   case 'duration':
    //         //     console.log(field);

    //         //     if (cell.value === 'Tas')

    //         //     break;
    //         //   default:
    //         //     console.log(field.name);
    //         //     break;
    //         // }
    //         bridge.set(field.name, { cell: cell, field: field });
    //       }
    //     } else {
    //       if (field.displayName === 'Remarks' && cellValue === 'remarks') {
    //         if (!bridge.has('projectRemarks')) {
    //           bridge.set('projectRemarks', { cell: cell, field: field });
    //         } else {
    //           bridge.set('remarks', { cell: cell, field: field });
    //         }
    //       } else if (cellValue === field.displayName.toLocaleLowerCase()) {
    //         bridge.set(field.name, { cell: cell, field: field });
    //       }
    //     }
    //   }
    // }

    // if (!this.bridgeHasWorkplanFields(bridge)) {
    //   console.log('Error state');
    //   return;
    // }

    // NOTE: Obtain values based on mapped addresses and 'find-value' prop

    // const workplan = new Workplan();
    // workplan.durationAndDateFormat = dateAndDurationFormat;

    // bridge.forEach((value: { cell: CustomCell, field: WorkplanField }, key: string) => {
    //   if (value.field.findValue.includes('immediate')) {
    //     const direction = value.field.findValue.split('-')[1];

    //     let result: CustomCell = undefined;
    //     if (direction === 'below') {
    //       result = inputSheet.getCell(`${value.cell.colName}${value.cell.rowNumber + 1}`);
    //     } else if (direction === 'right') {
    //       result = inputSheet.getCell(`${nPlusColumn(value.cell.colName, 1)}${value.cell.rowNumber}`);
    //     }
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     workplan[key as keyof Workplan] = result.value;
    //   }
    // });

    // workplan.activities = [];
    // workplan.timeStatus = undefined;
    // workplan.status = undefined;

    // let dataRowNumber = 0;
    // for (let i = 0; i < inputSheet.rows.length; i++) {
    //   const row = inputSheet.rows[i];
    //   const firstCell = row.cells[0];

    //   if (firstCell.type === 'Header 2') {
    //     dataRowNumber = firstCell.rowNumber + 1;
    //     break;
    //   }
    // }

    // for (let i = 0; i < inputSheet.rows.length; i++) {
    //   const row = inputSheet.rows[i];

    //   if (row.rowNumber >= dataRowNumber) {

    //   }
    // }

    // const milestoneRows = [];

    // for (let i = 0; i < inputSheet.rows.length; i++) {
    //   const row = inputSheet.rows[i];

    //   if (row.rowNumber >= dataRowNumber) {
    //     const firstCell = row.cells[0];

    //     if (firstCell.type === 'Milestone') {
    //       milestoneRows.push(firstCell.rowNumber);
    //     }
    //   }
    // }

    // for (let i = 0; i < milestoneRows.length; i++) {

    //   if (i === milestoneRows.length - 1) {
    //     this.generateMilestone(milestoneRows[i], -1, inputSheet, bridge);
    //   } else {
    //     this.generateMilestone(milestoneRows[i], milestoneRows[i + 1] - 1, inputSheet, bridge);
    //   }

    // }

    // console.log(testObject);
    // console.log(bridge);

    perfMeter.end();
    perfMeter.log('Worksheet into Workplan transformation');
  }

  //#region Test for required fields.
  private bridgeHasRequiredFields(bridge: WorkplanBridge): boolean {

    let hasAllFields = true;

    for (let i = 0; i < 7; i++) {
      const field = workplanFields[i];
      if (field.mandatory) {
        if (!bridge.has(field.name)) {
          hasAllFields = false;
          break;
        }
      }
    }

    return hasAllFields;
  }

  //#region: Get required fields
  private getRequiredFields(workplan: Workplan, bridge: WorkplanBridge, sheet: CustomWorksheet): void {
    bridge.forEach((value: WorkplanBridgeValue, key: string) => {
      if (value.field.findValue.includes('immediate')) {
        let result: CustomCell = undefined;
        const direction = value.field.findValue.split('-')[1];
        if (direction === 'below') {
          result = sheet.getCell(`${value.cell.colName}${value.cell.rowNumber + 1}`);
        } else if (direction === 'right') {
          result = sheet.getCell(`${nPlusColumn(value.cell.colName, 1)}${value.cell.rowNumber}`);
        }

        if (!result.value) {
          if (value.field.expectedType === 'string') {
            result.value = '';
          }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        workplan[key as keyof Workplan] = result.value;

        if (value.field.expectedType.includes('t:')) {
          if (value.field.expectedType === 't:WPDate') {
            if (/^[0-9]*$/.test(result.value.toString())) {
              workplan.durationAndDateFormat = 0;

              const date: WPDate = {
                weekNo: result.value as number,
                date: getDateFromFiscal(result.value as number, 2024, 0),
                fiscalYear: 2024
              };

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              workplan[key as keyof Workplan] = date;

              workplan.durationAndDateFormat = 0;
            } else {

              const date: WPDate = {
                weekNo: getFiscalWeek(result.value as Date),
                date: result.value as Date,
                fiscalYear: getFiscalYear(result.value as Date),
              };
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              workplan[key as keyof Workplan] = date;

              workplan.durationAndDateFormat = 1;
            }
          }
        }
      }
    });
  }

  //#region Generate activities
  private generateActivities(workplan: Workplan, bridge: WorkplanBridge, sheet: CustomWorksheet) {
    let startRow = 0;

    for (let i = 0; i < sheet.rows.length; i++) {
      const row = sheet.rows[i];
      const firstCell = row.cells[0];

      if (firstCell.type === 'Header 2') {
        startRow = firstCell.rowNumber + 1;
        break;
      }
    }

    const milestones = [];

    let lastMilestoneIndex = -1;
    let lastTaskIndex = -1;
    let lastSubtaskIndex = -1;

    for (let i = 0; i < sheet.rows.length; i++) {
      const row = sheet.rows[i];

      if (row.rowNumber >= startRow) {
        const firstCell = row.cells[0];

        if (firstCell.type === 'Milestone') {
          const milestone = this.getMilestone(row.rowNumber, bridge, sheet, workplan);


          milestones.push(milestone);
          lastMilestoneIndex = milestones.length - 1;
        } else if (firstCell.type === 'Task') {
          const parentMilestone = milestones[lastMilestoneIndex];

          const task = this.getTask(row.rowNumber, bridge, sheet, workplan);

          parentMilestone.tasks.push(task);

          lastTaskIndex = parentMilestone.tasks.length - 1;

        } else if (firstCell.type === 'Subtask') {
          const parentTask = milestones[lastMilestoneIndex].tasks[lastTaskIndex];
          const subtask = new Task();
          subtask.name = `Subtask ${lastSubtaskIndex + 1}`

          parentTask.subtasks.push(subtask);

          lastSubtaskIndex = parentTask.subtasks.length - 1;
        }
      }
    }

    // console.log(JSON.stringify(milestones));
    // console.log(milestones);
  }

  //#region Generate Milestone
  private getMilestone(rowNumber: number, bridge: WorkplanBridge, sheet: CustomWorksheet, workplan: Workplan): Milestone {
    const milestone = new Milestone();

    milestone.flag = this.findValue('flag', rowNumber, bridge, sheet) as Flag;
    milestone.label = this.findValue('label', rowNumber, bridge, sheet) as Label;
    milestone.number = this.findValue('number', rowNumber, bridge, sheet) as string;
    milestone.name = this.findValue('name', rowNumber, bridge, sheet) as string;
    milestone.jiraId = this.findValue('jiraId', rowNumber, bridge, sheet) as string;
    milestone.responsible = this.findValue('responsible', rowNumber, bridge, sheet) as string;
    milestone.status = this.findValue('status', rowNumber, bridge, sheet) as Status;
    milestone.progress = this.findValue('progress', rowNumber, bridge, sheet) as number;
    milestone.storyPoints = this.findValue('storyPoints', rowNumber, bridge, sheet) as number;
    milestone.duration = this.findValue('duration', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as Duration;
    milestone.startDate = this.findValue('startDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    milestone.finishDate = this.findValue('finishDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    milestone.newFinishDate = this.findValue('newFinishDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    milestone.actualDate = this.findValue('actualDate', rowNumber, bridge, sheet) as WPDate;
    milestone.predecessor = this.findValue('predecessor', rowNumber, bridge, sheet) as string;
    milestone.completedCount = this.findValue('completedCount', rowNumber, bridge, sheet) as number;
    milestone.targetCount = this.findValue('targetCount', rowNumber, bridge, sheet) as number;
    milestone.remainingCount = this.findValue('remainingCount', rowNumber, bridge, sheet) as number;
    milestone.receivedLastWeekCount = this.findValue('receivedLastWeekCount', rowNumber, bridge, sheet) as number;
    milestone.workedLastWeekCount = this.findValue('workedLastWeekCount', rowNumber, bridge, sheet) as number;
    milestone.remarks = this.findValue('remarks', rowNumber, bridge, sheet) as string;
    milestone.comments = this.findValue('comments', rowNumber, bridge, sheet) as string;
    milestone.lastUpdated = this.findValue('lastUpdated', rowNumber, bridge, sheet) as WPDate;

    return milestone;
  }

  //#region Generate Task
  private getTask(rowNumber: number, bridge: WorkplanBridge, sheet: CustomWorksheet, workplan: Workplan): Task {
    const task = new Task();

    task.flag = this.findValue('flag', rowNumber, bridge, sheet) as Flag;
    task.label = this.findValue('label', rowNumber, bridge, sheet) as Label;
    task.name = this.findValue('name', rowNumber, bridge, sheet) as string;
    task.jiraId = this.findValue('jiraId', rowNumber, bridge, sheet) as string;
    task.responsible = this.findValue('responsible', rowNumber, bridge, sheet) as string;
    task.status = this.findValue('status', rowNumber, bridge, sheet) as Status;
    task.progress = this.findValue('progress', rowNumber, bridge, sheet) as number;
    task.storyPoints = this.findValue('storyPoints', rowNumber, bridge, sheet) as number;
    task.duration = this.findValue('duration', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as Duration;
    task.startDate = this.findValue('startDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    task.finishDate = this.findValue('finishDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    task.newFinishDate = this.findValue('newFinishDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    task.actualDate = this.findValue('actualDate', rowNumber, bridge, sheet, { dateFormat: workplan.durationAndDateFormat }) as WPDate;
    task.predecessor = this.findValue('predecessor', rowNumber, bridge, sheet) as string;
    task.completedCount = this.findValue('completedConut', rowNumber, bridge, sheet) as number;
    task.targetCount = this.findValue('targetCount', rowNumber, bridge, sheet) as number;
    task.remainingCount = this.findValue('remainingCount', rowNumber, bridge, sheet) as number;
    task.receivedLastWeekCount = this.findValue('receivedLastWeekCount', rowNumber, bridge, sheet) as number;
    task.workedLastWeekCount = this.findValue('workedLastWeekCount', rowNumber, bridge, sheet) as number;
    task.remarks = this.findValue('remarks', rowNumber, bridge, sheet) as string;
    task.comments = this.findValue('comments', rowNumber, bridge, sheet) as string;
    task.lastUpdated = this.findValue('lastUpdated', rowNumber, bridge, sheet) as WPDate;

    console.log(task);

    return task;
  }

  //#region Find value
  private findValue(fieldName: string, rowNumber: number, bridge: WorkplanBridge, sheet: CustomWorksheet, options?: { dateFormat: number }): number | string | boolean | undefined | WPDate | Flag | Label | Duration {
    const bridgeValue = bridge.get(fieldName);

    if (!bridgeValue) {
      // Not an error. Simply not a mandatory field.
      return undefined;
    }

    if (bridgeValue.field.findValue === 'column-down') {
      const col = bridgeValue.cell.colName;
      const value = sheet.getCell(`${col}${rowNumber}`).value;
      switch (bridgeValue.field.expectedType) {

        case 'number': {
          if (value !== undefined) {
            return value as number;
          }
          // Return code for "Missing value" => FF (hex) or 255 (dec)
          return -0xFF;
        }

        case 'string': {
          if (value !== undefined) {
            return `${value}`;
          }
          return '';
        }

        case 't:Flag': {
          let flag = Flag.None;

          if (value) {
            if (value === 'Completed') {
              flag = Flag.Completed;
            }

            if (value === 'Risk') {
              flag = Flag.Risk;
            }

            if (value === 'Report') {
              flag = Flag.Report;
            }

            if (value === 'Recurrent') {
              flag = Flag.Recurrent;
            }

            if (value === 'Recurrent / Report') {
              flag = Flag.RecurrentReport;
            }
          } else {
            flag = Flag.None;
          }
          return flag;
        }

        case 't:Status': {
          let status = Status.NotStarted;
          if (value !== undefined) {
            if (value === 'Not Started') {
              status = Status.NotStarted;
            }

            if (value === 'Completed') {
              status = Status.Completed;
            }

            if (value === 'On Hold') {
              status = Status.OnHold;
            }

            if (value === 'Cancelled') {
              status = Status.Cancelled;
            }

            if (value === 'In Work') {
              status = Status.InWork;
            }
          }
          return status;
        }

        case 't:Duration': {
          if (value) {

            if (options.dateFormat === 0) {
              const duration: Duration = {
                weeks: value as number,
                days: value as number * 5
              };

              return duration;
            } else if (options.dateFormat === 1) {
              const duration: Duration = {
                weeks: 0,
                days: value as number
              };

              return duration;
            }
          }

          const duration: Duration = {
            weeks: -0xFF,
            days: -0xFF
          };

          return duration;
        }

        case 't:WPDate': {
          if (value) {

            if (customIsDate(value)) {
              const date: WPDate = {
                weekNo: getFiscalWeek(value as Date),
                date: value as Date,
                fiscalYear: getFiscalYear(value as Date)
              };

              return date;

            } else {
              let side = 1;
              if (fieldName === 'startDate') {
                side = 0;
              }
              if (`${value}`.includes('.')) {
                console.log('managing');

                const [weekString, yearString] = `${value}`.split('.');

                const date: WPDate = {
                  weekNo: Number.parseInt(weekString),
                  date: getDateFromFiscal(Number.parseInt(weekString), Number.parseInt(`20${yearString}`), side),
                  fiscalYear: Number.parseInt(`20${yearString}`)
                };
                return date;
              } else {


                const date: WPDate = {
                  weekNo: value as number,
                  date: getDateFromFiscal(value as number, 2024, side),
                  fiscalYear: 2024
                };
                return date;
              }

            }
          }

          const date: WPDate = {
            weekNo: -0xFF,
            date: new Date('1993/05/14'),
            fiscalYear: -0xFF
          };
          return date;
        }
      }
    }
  }

  // private generateIndividualActivity(): void {

  // }

  //#region Generate milestones
  /*   private generateMilestone(startRow: number, endRow: number, inputSheet: CustomWorksheet, bridge: WorkplanBridge) {
  
  
      const milestone = new Milestone();
  
      milestone.flag = this.findValue('flag', inputSheet, bridge, startRow) as Flag;
      milestone.label = this.findValue('label', inputSheet, bridge, startRow) as Label;
      milestone.number = this.findValue('number', inputSheet, bridge, startRow) as string;
      milestone.name = this.findValue('name', inputSheet, bridge, startRow) as string;
      milestone.jiraId = this.findValue('jiraId', inputSheet, bridge, startRow) as string;
      milestone.responsible = this.findValue('responsible', inputSheet, bridge, startRow) as string;
      milestone.progress = this.findValue('progress', inputSheet, bridge, startRow) as number;
      milestone.storyPoints = this.findValue('storyPoints', inputSheet, bridge, startRow) as number;
      milestone.predecessor = this.findValue('predecessor', inputSheet, bridge, startRow) as string;
      milestone.completedCount = this.findValue('completedCount', inputSheet, bridge, startRow) as number;
      milestone.targetCount = this.findValue('targetCount', inputSheet, bridge, startRow) as number;
      milestone.remainingCount = this.findValue('remainingCount', inputSheet, bridge, startRow) as number;
      milestone.receivedLastWeekCount = this.findValue('receivedLastWeekCount', inputSheet, bridge, startRow) as number;
      milestone.workedLastWeekCount = this.findValue('workedLastWeek', inputSheet, bridge, startRow) as number;
      milestone.remarks = this.findValue('remarks', inputSheet, bridge, startRow) as string;
      milestone.comments = this.findValue('comments', inputSheet, bridge, startRow) as string;
      milestone.lastUpdated = this.findValue('lastUpdated', inputSheet, bridge, startRow) as WPDate;
      // TODO: Get tasks
  
  
      const tasks = this.generateTasks(startRow, endRow, inputSheet, bridge);
      milestone.tasks = tasks;
  
      TODO: Calculate these parameters
      - If they are present in workplan -> Check to see if they are correct.
      - If they are not -> Assign them
  
      Milestone
      status
      duration
      startDate
      finishDate.
      newFinishDate
      actualDate
  
    } */

  //#region Generate tasks
  /*  private generateTasks(startRow: number, endRow: number, inputSheet: CustomWorksheet, bridge: WorkplanBridge): Task[] {
     // console.log(startRow, endRow);
     startRow = startRow + 1;
 
     if (endRow === -1) {
       endRow = inputSheet.rows[inputSheet.rows.length - 1].rowNumber;
     }
 
     if (startRow > endRow) {
       return [];
     }
 
     for (let i = startRow; i <= endRow; i++) {
       const row = inputSheet.getRow(i);
 
       // console.log(row.rowNumber);
       const testCell = row.cells[0];
 
       // console.log(testCell.value, testCell.type);
 
       if (testCell.type === 'Task') {
 
         const task = new Task();
 
         task.flag = this.findValue('flag', inputSheet, bridge, row.rowNumber) as Flag;
         task.label = this.findValue('label', inputSheet, bridge, row.rowNumber) as Label;
         task.number = this.findValue('number', inputSheet, bridge, row.rowNumber) as string;
         task.name = this.findValue('name', inputSheet, bridge, row.rowNumber) as string;
         task.jiraId = this.findValue('jiraId', inputSheet, bridge, row.rowNumber) as string;
         task.responsible = this.findValue('responsible', inputSheet, bridge, row.rowNumber) as string;
         task.status = this.findValue('status', inputSheet, bridge, row.rowNumber) as Status;
         task.progress = this.findValue('progress', inputSheet, bridge, row.rowNumber) as number;
 
         task.duration = this.findValue('duration', inputSheet, bridge, row.rowNumber) as Duration;
         task.startDate = this.findValue('startDate', inputSheet, bridge, row.rowNumber) as WPDate;
         task.finishDate = this.findValue('finishDate', inputSheet, bridge, row.rowNumber) as WPDate;
         task.newFinishDate = this.findValue('newFinishDate', inputSheet, bridge, row.rowNumber) as WPDate;
         task.actualDate = this.findValue('actualDate', inputSheet, bridge, row.rowNumber) as WPDate;
         task.predecessor = this.findValue('predecessor', inputSheet, bridge, row.rowNumber) as string;
         task.completedCount = this.findValue('completedCount', inputSheet, bridge, row.rowNumber) as number;
         task.targetCount = this.findValue('targetCount', inputSheet, bridge, row.rowNumber) as number;
         task.remainingCount = this.findValue('remainingCount', inputSheet, bridge, row.rowNumber) as number;
         task.receivedLastWeekCount = this.findValue('receivedLastWeekCount', inputSheet, bridge, row.rowNumber) as number;
         task.workedLastWeekCount = this.findValue('workedLastWeekCount', inputSheet, bridge, row.rowNumber) as number;
         task.remarks = this.findValue('remarks', inputSheet, bridge, row.rowNumber) as string;
         task.comments = this.findValue('comments', inputSheet, bridge, row.rowNumber) as string;
         task.lastUpdated = this.findValue('lastUpdated', inputSheet, bridge, row.rowNumber) as WPDate;
         // console.log(task.flag, task.number, task.name);
 
         // console.log(task.toString());
         // console.log(task.toString());
 
       } else {
         // console.log('manage subtasks');
         // TODO: Manage subtasks
       }
                                                                                           
       // console.log(testCell.type);
     }
 
   }
 
   private findValue(name: string, inputSheet: CustomWorksheet, bridge: WorkplanBridge, rowNumber: number): number | string | boolean | WPDate | undefined | Flag | Label | Duration {
 
     const bridgeValue = bridge.get(name);
 
     if (!bridgeValue) {
       // TODO: Manage error
       return undefined;
     }
 
     if (bridgeValue.field.findValue === 'column-down') {
       const col = bridgeValue.cell.colName;
 
       const value = inputSheet.getCell(`${col}${rowNumber}`).value;
 
       switch (bridgeValue.field.expectedType) {
         case 'string': {
           if (value) {
             return `${value}`;
           }
           return '';
         }
 
         case 'number': {
           let result = 0;
 
           if (!value) {
             return result;
           }
 
           if (typeof value === 'number') {
             return value;
           }
 
           if (typeof value === 'string') {
             try {
               if (value.includes('.')) {
                 result = Number.parseFloat(value);
               } else {
                 result = Number.parseInt(value);
               }
             } catch (_) {
               result = 0;
             }
           } else if (typeof value === 'object') {
             // console.log(value);
           }
 
           return result;
         }
 
         case 't:Flag': {
           if (value) {
             let flag: Flag = Flag.None;
 
             if (typeof value === 'string') {
 
               if (value === 'Completed') {
                 flag = Flag.Completed;
               }
 
               if (value === 'Risk') {
                 flag = Flag.Risk;
               }
 
               if (value === 'Report') {
                 flag = Flag.Report;
               }
 
               if (value === 'Recurrent') {
                 flag = Flag.Recurrent;
               }
 
               if (value === 'Recurrent / Report') {
                 flag = Flag.RecurrentReport;
               }
 
               return flag;
             }
 
             return flag;
 
           }
 
           return Flag.None;
         }
 
         case 't:Status': {
           if (value) {
             let status: Status = Status.NotStarted;
 
             if (typeof value === 'string') {
               if (value === 'In Work') {
                 status = Status.InWork;
               }
 
               if (value === 'Completed') {
                 status = Status.Completed;
               }
 
               if (value === 'On Hold') {
                 status = Status.OnHold;
               }
 
               if (value === 'Cancelled') {
                 status = Status.Cancelled;
               }
 
               if (value === 'Not Started') {
                 status = Status.NotStarted;
               }
 
               return status;
             }
           }
 
           return Status.NotStarted;
         }
 
         case 't:Duration': {
           let actualDurationValue = undefined;
           if (typeof value === 'string') {
             actualDurationValue = Number.parseInt(value.match(/[^a-z\s]/gi)[0]) || 0;
           } else if (typeof value === 'number') {
             actualDurationValue = value;
           }
 
           if (bridgeValue.cell.value === 'Task Duration (Weeks)') {
             const duration: Duration = {
               weeks: actualDurationValue,
               days: actualDurationValue * 5
             };
 
             return duration;
           } else if (bridgeValue.cell.value === 'Task Duration (Days)') {
             const duration: Duration = {
               weeks: Math.ceil(actualDurationValue / 5),
               days: actualDurationValue
             };
 
             return duration;
           } else if (bridgeValue.cell.value === 'Estimated Time' || bridgeValue.cell.value === 'Estimated Time (Days)') {
             const duration: Duration = {
               weeks: Math.ceil(actualDurationValue / 5),
               days: actualDurationValue
             };
 
             return duration;
           } else {
             // Assume weeks
             const duration: Duration = {
               weeks: actualDurationValue,
               days: actualDurationValue * 5
             };
 
             return duration;
           }
         }
 
         case 't:WPDate': {
           // console.log(name, typeof value);
           if (!value) {
             const date: WPDate = {
               date: undefined,
               weekNo: undefined,
               fiscalYear: undefined
             };
 
             return date;
           }
 
           if (typeof value === 'object') {
             const date: WPDate = {
               date: new Date(value.toString()),
               weekNo: 1,
               fiscalYear: getFiscalYear(new Date(value.toString()))
             };
 
             // console.log(date, 'aaa');
 
           } else if (typeof value === 'number') {
             // console.log(value % 1 !== 0);
             // console.log(value);
 
             if (value % 1 === 0) {
               const date: WPDate = {
                 date: undefined,
                 weekNo: Number.parseInt(`${value}`),
                 fiscalYear: 2024
               }
               
               return date;
             } else {
               // console.log(value);
             }
 
            
             // console.log(date);
           } else {
             console.log('WTFF');
           }
           // console.log(name, value, typeof value);
           break;
         }
 
         default: {
           return `${value}`;
         }
       }
     }
   } */

  //#region Workplan Bridge Provider
  private provideWorkplanBridge(inputSheet: CustomWorksheet): WorkplanBridge {
    const bridge: WorkplanBridge = new Map();
    // TODO: Change this range for settings range.
    const testCells = inputSheet.getRange('A1:V10');
    for (let i = 0; i < testCells.length; i++) {
      const cell = testCells[i];
      const cellValue = `${cell.value}`.toLocaleLowerCase();

      for (let j = 0; j < workplanFields.length; j++) {
        const field = workplanFields[j];

        if (field.aliases.length > 0) {
          for (let k = 0; k < field.aliases.length; k++) {
            const alias = field.aliases[k];

            if (cellValue === alias.toLocaleLowerCase()) {
              bridge.set(field.name, { cell: cell, field: field });
            }
          }

          // if (field.aliases.includes(`${cellValue}`)) {
          //   if (field.name === 'duration') {
          //     if (cellValue.toString().includes('Weeks')) {
          //       dateAndDurationFormat
          //     }
          //   }
          // }

        } else {
          if (cellValue === 'remarks' && field.displayName === 'Remarks') {
            if (bridge.has('projectRemarks')) {
              bridge.set('remarks', { cell: cell, field: field });
            } else {
              bridge.set('projectRemarks', { cell: cell, field: field });
            }
          } else if (cellValue === field.displayName.toLocaleLowerCase()) {
            bridge.set(field.name, { cell: cell, field: field });
          }
        }
      }
    }
    return bridge;
  }
}
