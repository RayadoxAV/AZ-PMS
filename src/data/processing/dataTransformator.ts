/* 
  Raymundo Paz
  March 2024
*/

import { nPlusColumn, workplanFields } from '../../util/util';
import { PerformanceMeter } from '../../util/performanceMeter';
import { CustomWorksheet, CustomCell, Milestone, Task } from '../data';
import { Duration, Flag, Label, Status, WPDate, WorkplanField } from '../../util/misc';

export class DataTransformator {
  public sheetToWorkplan(inputSheet: CustomWorksheet): void {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    /* Steps for the conversion:
      1. Determine the Workplan Version (1, 2, 3) and the Workplan Type (Daily, Scrum , Weekly)
        1.1
        1.2
        1.3
      2. Basing us on the version and type, we generate a bridge that tells us where to find all the relevant data.
        2.1
        2.2
        2.3
      3. Iterate over all of the bridge entries to get the project data.
        3.1
        3.2
        3.3
      4. Search and generate all the milestones
        4.1 Iterate over the rows that are inside of the Milestone range and look for the Milestone color (#d6dce4)
        4.2 Take as much fields as needed.
        4.3
      5. Search and generate all the tasks.
        5.1
        5.2
        5.3
      6. Calculate Work Status, Time Status and other calculated fields
        6.1
        6.2
        6.3
    */

    const bridge = new Map<string, { cell: CustomCell, field: WorkplanField }>();



    for (let i = 0; i < inputSheet.cells.length; i++) {
      const cell = inputSheet.cells[i];
      const cellValue = `${cell.value}`.toLocaleLowerCase();

      for (let j = 0; j < workplanFields.length; j++) {
        const field = workplanFields[j];

        if (field.aliases.length > 0) {
          if (field.aliases.includes(`${cell.value}`)) {
            // console.log(cellValue);
            // TODO: Manage cases per type of field 
          }
        } else {
          if (field.displayName === 'Remarks' && cellValue === 'remarks') {
            if (!bridge.has('projectRemarks')) {
              bridge.set('projectRemarks', { cell: cell, field: field });
            } else {
              bridge.set('remarks', { cell: cell, field: field });
            }
          } else if (cellValue === field.displayName.toLocaleLowerCase()) {
            // console.log(cellValue, cell.address);
            bridge.set(field.name, { cell: cell, field: field });
          }
        }
      }
    }


    // NOTE: Obtain values based on mapped addresses and 'find-value' prop

    const testObject: any = {};

    bridge.forEach((value: { cell: CustomCell, field: WorkplanField }, key: string) => {
      if (value.field.findValue.includes('immediate')) {
        const direction = value.field.findValue.split('-')[1];

        let result: CustomCell = undefined;
        if (direction === 'below') {
          result = inputSheet.getCell(`${value.cell.colName}${value.cell.rowNumber + 1}`);
        } else if (direction === 'right') {
          result = inputSheet.getCell(`${nPlusColumn(value.cell.colName, 1)}${value.cell.rowNumber}`);
        }
        testObject[key] = result.value;
      }
    });

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

    const milestoneRows = [];

    for (let i = 0; i < inputSheet.rows.length; i++) {
      const row = inputSheet.rows[i];

      if (row.rowNumber >= dataRowNumber) {
        const firstCell = row.cells[0];

        if (firstCell.type === 'Milestone') {
          milestoneRows.push(firstCell.rowNumber);
        }
      }
    }

    for (let i = 0; i < milestoneRows.length; i++) {

      if (i === milestoneRows.length - 1) {
        this.generateMilestone(milestoneRows[i], -1, inputSheet, bridge);
      } else {
        this.generateMilestone(milestoneRows[i], milestoneRows[i + 1] - 1, inputSheet, bridge);
      }

    }

    // console.log(testObject);

    perfMeter.end();
    perfMeter.log('Worksheet into Workplan transformation');
  }

  private generateMilestone(startRow: number, endRow: number, inputSheet: CustomWorksheet, bridge: Map<string, { cell: CustomCell, field: WorkplanField }>) {

    // const row = inputSheet.getRow(startRow);

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

    // TODO: Check if they are present in the workplan.
    // If they are, calculate to make sure they are correct.
    // If not, calculate normally


    // milestone.status
    // milestone.duration = this.findValue('duration', inputSheet, bridge)
    // milestone.startDate
    // milestone.finishDate.
    // milestone.newFinishDate
    // milestone.actualDate
    


    
    // console.log(milestone);
  }

private generateTasks(startRow: number, endRow: number, inputSheet: CustomWorksheet, bridge: Map<string, { cell: CustomCell, field: WorkplanField }>): Task[] {
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
        console.log(task);

      } else {
        // console.log('manage subtasks');
        // TODO: Manage subtasks
      }
      
      // console.log(testCell.type);
    }

  }

  private findValue(name: string, inputSheet: CustomWorksheet, bridge: Map<string, { cell: CustomCell, field: WorkplanField }>, rowNumber: number): number | string | boolean | WPDate | undefined | Flag | Label | Duration {

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
            console.log(value);
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

        default: {
          return `${value}`;
        }
      }
    }
  }
}
