/* 
  Raymundo Paz
  March 2024
*/

import { Cell, FillPattern, RichText, Row, Workbook, Worksheet } from 'exceljs';
import { XOR, isDate, isCellErrorValue, isCellFormulaValue, isCellHyperlinkValue, isCellRichTextValue, isCellSharedFormulaValue } from '../../util/util';
import { CustomCell, CustomRow, CustomWorkbook, CustomWorksheet } from '../data';
import { existsSync } from 'fs';
import { PerformanceMeter } from '../../util/performanceMeter'
import { CellError, CellType } from '../../util/misc';
// import { Logger, LogType } from '../../util/logger';

export class DataCollector {
  async provideWorkbook(args?: string[]): Promise<CustomWorkbook> {
    let path: string;
    let projectId: string;
    let link: string;
    if (args) {
      path = args[0];
      projectId = args[1];
      link = args[2];
    } else {
      path = global.shared.args.path;
      projectId = global.shared.args.projectId;
      link = global.shared.args.link;
    }

    // const { path, projectId, link } = global.shared.args;

    if (!projectId) {
      // TODO: Error state, send to error manager;
      throw new Error('No project id');
    }

    if (!XOR(path, link)) {
      // TODO: Error state, send to error manager;
      throw new Error('Both path and link provided');
    }

    if (!path && !link) {
      // TODO: Error state, send to error manager;
      throw new Error('No link or path provided');
    }

    let customWorkbook: CustomWorkbook;

    if (path) {
      customWorkbook = await this.provideByPath(path);
    } else {
      customWorkbook = await this.provideByLink(link);
    }

    return customWorkbook;
  }

  async provideByPath(path: string): Promise<CustomWorkbook> {
    const workbook = new Workbook();

    if (!existsSync(path)) {
      // TODO: Error state, send to error manager
      throw new Error('Non existent path.');
    }

    try {
      await workbook.xlsx.readFile(path);

      const customWorkbook = this.convertExJsToCWB(workbook);
      customWorkbook.path = path;
      customWorkbook.name = path.split('/').pop();

      return customWorkbook;
    } catch (error) { /* empty */ }
    return new CustomWorkbook();
  }

  private convertExJsToCWB(inputWorkbook: Workbook): CustomWorkbook {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    const customWorkbook = new CustomWorkbook();

    inputWorkbook.eachSheet((worksheet: Worksheet) => {

      if (worksheet.state === 'visible') {
        const customSheet = new CustomWorksheet();

        customSheet.name = worksheet.name;

        worksheet.eachRow((row: Row, rowNumber: number) => {
          const customRow = new CustomRow();
          customRow.rowNumber = rowNumber;

          row.eachCell((cell: Cell) => {

            const customCell = new CustomCell();
            customCell.address = cell.address;
            customCell.rowNumber = customRow.rowNumber;
            customCell.colName = cell.address.match(/[a-z]+|[^a-z]+/gi)[0] || '';
            customCell.value = this.getCellValueFromExJs(cell);

            let cellType: CellType;

            if (cell.style.fill) {
              if (cell.style.fill.type === 'pattern') {
                const fill = cell.style.fill as FillPattern;
                if (fill.pattern === 'none') {
                  cellType = 'Task';
                } else if (fill.pattern === 'solid') {
                  if (fill.fgColor) {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                    if (fill.fgColor.tint === -0.499984740745262) {
                      cellType = 'Header'
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                    } else if (fill.fgColor.tint === -0.249977111117893) {
                      cellType = 'Header 2';
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                    } else if (fill.fgColor.tint === 0.7999816888943144) {
                      cellType = 'Milestone';
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                    } else if (fill.fgColor.tint === -0.0499893185216834) {
                      cellType = 'Subtask';
                    } else {
                      // console.log(fill.fgColor.tint, fill.fgColor.tint === -0.0499893185216834, cell.address);
                      cellType = 'Task';
                    }
                  } else {
                    cellType = 'Task';
                  }
                }
              }
            } else {
              cellType = 'Task';
            }

            customCell.type = cellType;
            customRow.cells.push(customCell);
            customSheet.cells.push(customCell);
          });
          customSheet.rows.push(customRow);
        });

        customWorkbook.sheets.push(customSheet);
      }
    });

    perfMeter.end();
    perfMeter.log('ExcelJS to CustomWB Conversion');
    return customWorkbook;
  }

  private getCellValueFromExJs(cell: Cell): number | string | boolean | Date | CellError {


    if (cell.value === null) {
      return { errorType: 'null' };
    }

    if (cell.value === undefined) {
      return undefined;
    }

    if (typeof cell.value === 'object') {

      if (isDate(cell.value)) {
        return cell.value;
      }

      if (isCellErrorValue(cell.value)) {
        const value: CellError = {
          errorType: cell.value.error
        };
        return value;
      }

      if (isCellRichTextValue(cell.value)) {
        const textResult = cell.value.richText.reduce((previousValue: RichText, currentValue: RichText) => {
          previousValue.text += currentValue.text;

          return previousValue;
        });

        return textResult.text;
      }

      if (isCellHyperlinkValue(cell.value)) {
        return cell.value.text;
      }

      if (isCellSharedFormulaValue(cell.value)) {

        if (cell.value.result) {
          if (isCellErrorValue(cell.value.result)) {
            return { errorType: `${cell.value.result}` };
          } else {
            return cell.value.result;
          }
        } else {
          return undefined;
        }

      }

      if (isCellFormulaValue(cell.value)) {
        if (cell.value.result) {
          if (isCellErrorValue(cell.value.result)) {
            return { errorType: `${cell.value.result}` };
          } else {
            return cell.value.result;
          }
        }
      } else {
        return undefined;
      }

      // const b = isCellFormulaValue(cell.value);


      // if (isCellFormulaValue(cell.value)) {
      //   // console.log('Its cell formula value');
      //   if (isCellErrorValue(cell.value.result)) {
      //     return { errorType: `${cell.value.result}` }
      //   } else {
      //     return cell.value.result;
      //   }
      // }



    } else {
      // console.log(cell.value);
      return cell.value;
    }

    return undefined;
  }

  async provideByLink(link: string): Promise<CustomWorkbook> {
    console.log(link);
    return new CustomWorkbook();
  }
}


