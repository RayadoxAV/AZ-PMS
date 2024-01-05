const { Workbook } = require("exceljs");
const { existsSync } = require('fs');
const Logger = require('../util/Logger');

const Util = require("../util/util");
const { ipcMain } = require("electron");

class WorkbookProvider {

  /**
   * Provides a Workbook based on a specified local path or URL
   * @param {String} pathOrUrl 
   * 
   */
  async provideWorkbook(pathOrUrl) {
    let workbook;
    if (Util.isPath([pathOrUrl])) {
      workbook = await this.extractFromPath(pathOrUrl);
    } else {
      workbook = await this.extractFromURL(pathOrUrl);
    }

    if (!workbook) {
      return {
        error: 'Could not open specified workbook'
      };
    }
    return workbook;
  }

  async extractFromPath(path) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    if (!existsSync(path)) {
      Logger.Log(`Workbook path does not exist: '${path}'`, 2);
      return;
    }

    try {
      await workbook.xlsx.readFile(path);
      return workbook;
    } catch (error) {
      console.log(error);
    }
  }

  async extractFromURL(url) {

  }

}

module.exports = WorkbookProvider;