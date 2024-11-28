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

    const fields = Array.from(workplanFields);

    for (let i = 0; i < cells.length; i++) {

      if (typeof cells[i].value === 'string') {
        const cellValue = `${cells[i].value}`.toLocaleLowerCase().trim();
        for (let j = 0; j < fields.length; j++) {
          const currentField = fields[j];

          if (currentField === 'remarks [project]' && (cellValue === 'remarks' || cellValue === 'risk remarks')) {
            if (cellValue === 'risk remarks') {
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
              bridge.set('remarks', `${col}${parseInt(row) + 1}`);
            } else if (cellValue === 'remarks') {
              if (!bridge.has('remarks [project]')) {
                const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
                bridge.set('remarks [project]', `${col}${parseInt(row) + 1}`);
              }
            }
          } else if (cellValue === currentField) {
            if (currentField === 'total progress' || currentField === 'planned progress' || currentField === 'task count') {
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
              const nextCol = Util.getNextColumn(col, 1);

              bridge.set(currentField, `${nextCol}${row}`);
            } else {
              const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
              bridge.set(currentField, `${col}${parseInt(row) + 1}`);
            }
          }

          // NOTE: Skip merged cells for remarks field :D
          if (cellValue === 'remarks' & cells[i]['_mergeCount'] > 0) {
            i += cells[i]['_mergeCount'];
          }
        }
      }
    }

    const optionalFields = Array.from(Util.optionalFields);

    for (let i = 0; i < cells.length; i++) {
      if (typeof cells[i].value === 'string') {
        const cellValue = `${cells[i].value}`.toLocaleLowerCase().trim();
        for (let j = 0; j < optionalFields.length; j++) {
          const currentField = optionalFields[j];

          if (currentField === cellValue) {
            const [col, row] = cells[i].address.match(/[a-z]+|[^a-z]+/gi);
            bridge.set(currentField, `${col}${parseInt(row) + 1}`);
          }
        }
      }
    }

    return bridge;
  }
}

module.exports = BridgeProvider;