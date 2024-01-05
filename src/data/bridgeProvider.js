const ExcelJS = require('exceljs');
const Util = require('../util/util');
const Logger = require('../util/Logger');


class BridgeProvider {

  /**
   * Iterate over all informational cells of a sheet and compare their value to that of the test fields
   * If they are the test field, then get the adjacent cell value to get the actual value for the workplan
   * Then create a Map of all with entries (value, address) to extract workplan data.
   * @param {number[]} workplanVersion - The fields for the workplan
   * @param {ExcelJS.Worksheet} workplanSheet - The sheet to extract the addresse
   */
  provideBridge(workplanFields, workplanSheet) {

    const bridge = new Map();

    const cells = Util.getRange(workplanSheet, 'A1:V10');

    for (let i = 0; i < cells.length; i++) {

      if (typeof cells[i].value === 'string') {
        const cellValue = `${cells[i].value}`.toLocaleLowerCase();

        for (let j = 0; j < workplanFields.length; j++) {
          const currentField = Util.testFields[workplanFields[j]];
          
          if (currentField === 'remarks [project]' && cellValue === 'remarks') {
            
            if (!bridge.has(7)) {
              
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);

              bridge.set(7, `${col}${parseInt(row) + 1}`);
            }
          } else if (cellValue === currentField) {

            if (currentField === 'total progress' || currentField === 'planned progress') {
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
              const nextCol = Util.getNextColumn(col, 1);

              bridge.set(workplanFields[j], `${nextCol}${row}`);
            } else {
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
              bridge.set(workplanFields[j], `${col}${parseInt(row) + 1}`);
            }
          }

          if (cellValue === 'remarks' && cells[i]['_mergeCount'] > 0) {
            i += cells[i]['_mergeCount'];
          }
        }
      }
    }

    Logger.Log('Bridge generated for workplan', 0);
    return bridge;
  }
}

module.exports = BridgeProvider;