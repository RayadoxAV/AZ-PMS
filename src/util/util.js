const { Worksheet } = require('exceljs');
const Logger = require('./Logger');

class Util {

  static testFields = [
    'project id',                  // 0
    'project name',                // 1
    'project objective',           // 2
    'project owner',               // 3
    'total progress',              // 4
    'planned progress',            // 5
    'project start date',          // 6
    'remarks [project]',           // 7
    'flags',                       // 8
    '#',                           // 9
    'task',                        // 10
    'responsible',                 // 11
    'status',                      // 12
    'progress',                    // 13
    'task duration (weeks)',       // 14
    'task duration (days)',        // 15
    'start date week',             // 16
    'start date',                  // 17
    'finish date week',            // 18
    'finish date',                 // 19
    'new finish date',             // 20
    'actual date',                 // 21
    'task predecessor',            // 22
    'completed (if applicable)',   // 23
    'target (if applicable)',      // 24
    'remaining (if applicable)',   // 25
    'remarks',                     // 26
    'comments',                    // 27
    'sub-task',                    // 28
    'story points',                // 29
    'description',                 // 30
    'project manager',             // 31
    'estimated time',              // 32
    'story',                       // 33
    'jira id',                     // 34
    'task duration (Days/Hours)',  // 35
    'original sprint',             // 36
    'last updated'                 // 37
  ];

  // Required fields that a Workplan of this version MUST have in order to be considered of this version
  static v3Fields = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  static V3RequiredMatches = 27;

  static v2Fields = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  static V2RequiredMatches = 24;

  static v1_5Fields = [1, 2, 4, 6, 9, 10, 11, 12, 13, 17, 19, 20, 21, 22];
  static v1_5RequiredMatches = 14;

  /* static weeklyTypeFields = {
    'v3': {
      fields: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
      minMatches: 0,
    },
    'v2': {
      fields: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27],
      minMatches: 0
    },
    'v1.5': {
      fields: [1, 2, 4, 6, 9, 10, 11, 12, 13, 17, 19, 20, 21, 22, 27, 31],
      minMatches: 0
    }
  };

  static dailyTypeFields = {
    'v3': {
      fields: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27],
      minMatches: 0
    },
    'v2': {
      fields: [],
      minMatches: 0
    },
    'v1.5': {
      fields: [],
      minMatches: 0
    }
  };

  static scrumTypeFields = {
    'v3': {
      fields: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30],
      minMatches: 0
    },
    'v2': {
      fields: [],
      minMatches: 0
    },
    'v1.5': {
      fields: [1, 2, 4, 6, 9, 10, 11, 12, 13, 17, 19, 20, 21, 22, 27, 29, 30, 32],
      minMatches: 18
    }
  }; */

  static isPath(testString) {
    if (!testString) {
      return false;
    }

    if (testString.includes('http://')) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * From: Hedgineering on: https://github.com/exceljs/exceljs/issues/416
   * @param {Worksheet} sheet sheet
   * @param {String} rangeCells
   * @returns {Cell[]} references 
   */
  static getRange(sheet, rangeCells) {
    let [startCell, endCell] = rangeCells.split(':');

    if (endCell < startCell) {
      const temp = endCell;
      endCell = startCell;
      startCell = temp;
    }

    let [endCellColumn, endRow] = endCell.match(/[a-z]+|[^a-z]+/gi);
    let [startCellColumn, startRow] = startCell.match(/[a-z]+|[^a-z]+/gi);

    if (endCellColumn < startCellColumn) {
      const temp = endCellColumn;
      endCellColumn = startCellColumn;
      startCellColumn = temp;
    }

    if (endRow < startRow) {
      const temp = endRow;
      endRow = startRow;
      startRow = temp;
    }

    const endColumn = sheet.getColumn(endCellColumn);
    const startColumn = sheet.getColumn(startCellColumn);

    if (!endColumn) {
      throw new Error('End column not found');
    }

    if (!startColumn) {
      throw new Error('Start column not found');
    }

    const endColumnNumber = endColumn.number;
    const startColumnNumber = startColumn.number;

    const cells = [];

    for (let i = parseInt(startRow); i <= parseInt(endRow); i++) {
      const row = sheet.getRow(i);

      for (let j = startColumnNumber; j <= endColumnNumber; j++) {
        cells.push(row.getCell(j));
      }
    }

    return cells;
  }

  /**
   * 
   * @param {String} column 
   * @param {Number} count 
   * @returns 
   */
  static getNextColumn(column, count) {
    column.toUpperCase();

    if (column.length === 1) {
      if (column === 'Z') {
        return 'AA';
      }

      return String.fromCharCode(column.charCodeAt(0) + 1);
    } else if (column.length === 2) {
      const [first, second] = column.split('');

      if (first === 'Z' && second === 'Z') {
        return 'AAA';
      } else if (second === 'Z') {
        return `${String.fromCharCode(first.charCodeAt(0) + 1)}A`;
      } else {
        return `${first}${String.fromCharCode(second.charCodeAt(0) + 1)}`;
      }

    } else {
      Logger.Log('getNextColumn does not support columns of 3 or more letters, yet', 2);
    }
    return '';
  }
  /**
   * 
   * @param {Number} fieldIndex 
   * @param {ExcelJS.Worksheet} workplanSheet 
   * @param {Map<Number, String>} bridge 
   * @returns 
   */
  static getValueForCell(fieldIndex, workplanSheet, bridge) {
    if (fieldIndex === -1) {
      return '';
    }

    if (!bridge.has(fieldIndex)) {
      return `No value in bridge for field '${Util.testFields[fieldIndex]}'`;
    }
    
    const value = workplanSheet.getCell(bridge.get(fieldIndex)).value;

    if (!value) {
      return `No value in cell for field '${Util.testFields[fieldIndex]}'`;
    }

    if (value.result) {
      return value.result;
    }

    return value;
  }

  static dateToWeek() {

  }

  /**
   * 
   * @param {Number} week 
   */
  static weekToDate(week) {
    const FYStartDate = new Date(2023, 7, 27);
    
    const dayUnit = 1000 * 60 * 60 * 24;

    const mondayOfWeek = new Date(FYStartDate.getTime() + (week * 7 * dayUnit) - (6 * dayUnit));
    const fridayOfWeek = new Date(FYStartDate.getTime() + (week * 7 * dayUnit) - (2 * dayUnit));
    
    return [mondayOfWeek, fridayOfWeek];
  }

  /**
   * 
   * @param {Date} date 
   */
  static dateToWeek(date) {
    
  }
}


module.exports = Util;