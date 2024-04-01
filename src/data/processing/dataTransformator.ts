/* 
  Raymundo Paz
  March 2024
*/

import { nPlusColumn, workplanFields } from '../../util/util';
import { PerformanceMeter } from '../../util/performanceMeter';
import { CustomWorksheet, CustomCell } from '../data';

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
    
    const map = new Map<string, any>();

/*     for (let i = 0; i < workplanFields.length; i++) {
      const field = workplanFields[i];
      
      for (let cellIndex = 0; cellIndex < inputSheet.cells.length; cellIndex++) {
        const cellValue = inputSheet.cells[cellIndex].value;

        if (!map.get(field.name)) {
          if (`${cellValue}`.toLocaleLowerCase() === field.displayName.toLocaleLowerCase()) {
            console.log(inputSheet.cells[cellIndex].address);
            map.set(field.name, { address: inputSheet.cells[cellIndex].address, direction: field.findValue });
          }
        } else {
          if (field.name === 'remarks' && `${cellValue}`.toLocaleLowerCase() === 'remarks') {
            console.log(field.name);
            map.set('remarks', { address: inputSheet.cells[cellIndex].address, direction: field.findValue });
          }
        }
      }

      // console.log(field.displayName, field.aliases);
    }
  */

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
            if (!map.has('projectRemarks')) {
              map.set('projectRemarks', { cell: cell, findValue: field.findValue });
            } else {
              map.set('remarks', { cell: cell, findValue: field.findValue });
            }
          } else if (cellValue === field.displayName.toLocaleLowerCase()) {
            // console.log(cellValue, cell.address);
            map.set(field.name, { cell: cell, findValue: field.findValue });
          }
        }
      }
    }

    // console.log(map);

    // NOTE: Obtain values based on mapped addresses and 'find-value' prop

    const testObject: any = {};
    
    map.forEach((value: any, key: string) => {
      if (value.findValue.includes('immediate')) {
        const direction = value.findValue.split('-')[1];

        let result: CustomCell = undefined;
        if (direction === 'below') {
          result = inputSheet.getCell(`${value.cell.colName}${value.cell.rowNumber + 1}`);
        } else if (direction === 'right') {
          result = inputSheet.getCell(`${nPlusColumn(value.cell.colName, 1)}${value.cell.rowNumber}`);
        }
        testObject[key] = result.value;
      }
    });

    // map.forEach((value: any, key: string): void => {
      
    // });

    for (let i = 0; i < inputSheet.rows.length; i++) {
      const row = inputSheet.rows[i];
      
      const firstCell = row.cells[0];

      
    }


    console.log(testObject);

    perfMeter.end();
    perfMeter.log('Worksheet into Workplan transformation');
  }
}
