/* 
  Raymundo Paz
  March 2024
*/

import { XOR } from 'src/util/util';
import { CustomWorkbook } from '../data';
import { existsSync } from 'fs';

export class DataCollector {
  async provideWorkbook(): Promise<CustomWorkbook> {
    const { path, projectId, link } = global.shared.args;

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
    } else if (link) {
      customWorkbook = this.provideByLink(link);
    }


    return customWorkbook;
  }

  async provideByPath(path: string): Promise<CustomWorkbook> {
    const workbook = new ExcelJS.Workbook();

    if (!existsSync(path)) {
      // TODO: Error state, send to error manager
      throw new Error('Non existen path.');
    }

    try {
      await workbook.xlsx.readFile(path);


    } catch (error) {

    }
  }
}


