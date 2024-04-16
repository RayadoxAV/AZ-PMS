/* 
  Raymundo Paz
  March 2024
*/

import { getFiscalYear, isWorkplan, nPlusColumn, workplanFields } from '../../util/util';
import { PerformanceMeter } from '../../util/performanceMeter';
import { CustomWorksheet, CustomCell, Milestone, Task, Workplan } from '../data';
import { Duration, Flag, Label, Status, WPDate, WorkplanBridge, WorkplanField } from '../../util/misc';

export class DataTransformator {
  public sheetToWorkplan(inputSheet: CustomWorksheet): void {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    const bridge: WorkplanBridge = new Map();

    for (let i = 0; i < inputSheet.cells.length; i++) {
      const cell = inputSheet.cells[i];
      const cellValue = `${cell.value}`.toLocaleLowerCase();

      for (let j = 0; j < workplanFields.length; j++) {
        const field = workplanFields[j];

        if (field.aliases.length > 0) {
          for (let k = 0; k < field.aliases.length; k++) {
            const alias = field.aliases[k];

            if (cellValue === alias.toLocaleLowerCase()) {
              bridge.set(field.name, { cell: cell, field: field});
            }
          }

          if (field.aliases.includes(`${cell.value}`)) {
            // TODO: Manage cases per type of field 
            console.log(field, cell.value);
          }
        } else {
          if (field.displayName === 'Remarks' && cellValue === 'remarks') {
            if (!bridge.has('projectRemarks')) {
              bridge.set('projectRemarks', { cell: cell, field: field });
            } else {
              bridge.set('remarks', { cell: cell, field: field });
            }
          } else if (cellValue === field.displayName.toLocaleLowerCase()) {
            bridge.set(field.name, { cell: cell, field: field });
          }
        }
      }
    }

    // NOTE: Obtain values based on mapped addresses and 'find-value' prop

    const workplan = new Workplan();
  
    bridge.forEach((value: { cell: CustomCell, field: WorkplanField }, key: string) => {
      if (value.field.findValue.includes('immediate')) {
        const direction = value.field.findValue.split('-')[1];

        let result: CustomCell = undefined;
        if (direction === 'below') {
          result = inputSheet.getCell(`${value.cell.colName}${value.cell.rowNumber + 1}`);
        } else if (direction === 'right') {
          result = inputSheet.getCell(`${nPlusColumn(value.cell.colName, 1)}${value.cell.rowNumber}`);
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        workplan[key as keyof Workplan] = result.value;
      }
    });

    workplan.activities = [];
    workplan.timeStatus = undefined;
    workplan.status = undefined;

    console.log('isWorkplan', isWorkplan(workplan));

    // console.log(bridge);
    // map.forEach((value: any, key: string): void => {

    // });

    // 1. First, find the first header2 type cell to start the search from the next row index.

    let dataRowNumber = 0;
    for (let i = 0; i < inputSheet.rows.length; i++) {
      const row = inputSheet.rows[i];
      const firstCell = row.cells[0];

      if (firstCell.type === 'Header 2') {
        dataRowNumber = firstCell.rowNumber + 1;
        break;
      }
    }

    for (let i = 0; i < inputSheet.rows.length; i++) {
      const row = inputSheet.rows[i];

      if (row.rowNumber >= dataRowNumber) {

        console.log(row.cells[0].value, row.cells[1].value, row.cells[2].value);

      }
    }

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
}
