/* 
  Raymundo Paz
  March 2024
*/

import { PerformanceMeter } from '.././../util/performanceMeter';
import { CustomWorksheet, CustomWorkbook } from '../data';

export class DataExtractor {

  public evaluateSheets(workbook: CustomWorkbook, projectId?: string): number {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    let validSheetIndex = -1;
  
    for (let i = 0; i < workbook.sheets.length; i++) {
      const worksheet = workbook.sheets[i];
      // TODO: Change this range for settings range.
      const result = this.evaluateSheet(worksheet, 'A1:V10', projectId);

      if (result) {
        validSheetIndex = i;
        break;
      }
    }

    perfMeter.end();
    perfMeter.log('Worksheets workplan evaluation');
    
    return validSheetIndex;
  }

  /**
   * The objective is to have an evaluation process that tells if the should be evaluated as a Workplan.
   * @param inputSheet 
   * @param range 
   */
  private evaluateSheet(inputSheet: CustomWorksheet, range: string, projectId?: string): boolean {

    const cells = inputSheet.getRange(range);

    let foundProjectId = false;
    let projectIdMatches = false;
    let hasWorkplanTitle = false;

    let targetRow = -1;
    let targetCol = '';

    for (let i = 0; i < cells.length; i++) {
      const value = cells[i].value;

      if (`${value}`.toLocaleLowerCase() === 'workplan') {
        hasWorkplanTitle = true;
      }
      
      if (`${value}`.toLocaleLowerCase() === 'project id') {
        targetRow = cells[i].rowNumber + 1;
        targetCol = cells[i].colName;
        foundProjectId = true;
      }

      if (foundProjectId) {
        if (`${value}` === projectId) {
          projectIdMatches = true;
          break;
        }
      }
    }

    return foundProjectId && projectIdMatches && hasWorkplanTitle;
  }
}
