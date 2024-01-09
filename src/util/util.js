const { Worksheet } = require('exceljs');
const Logger = require('./Logger');

class Util {

  static dates = {
    '8/27/2023': 1, '8/28/2023': 1, '8/29/2023': 1, '8/30/2023': 1, '8/31/2023': 1, '9/1/2023': 1, '9/2/2023': 1, '9/3/2023': 2, '9/4/2023': 2, '9/5/2023': 2, '9/6/2023': 2, '9/7/2023': 2, '9/8/2023': 2, '9/9/2023': 2, '9/10/2023': 3, '9/11/2023': 3, '9/12/2023': 3, '9/13/2023': 3, '9/14/2023': 3, '9/15/2023': 3, '9/16/2023': 3, '9/17/2023': 4, '9/18/2023': 4, '9/19/2023': 4, '9/20/2023': 4, '9/21/2023': 4, '9/22/2023': 4, '9/23/2023': 4, '9/24/2023': 5, '9/25/2023': 5, '9/26/2023': 5, '9/27/2023': 5, '9/28/2023': 5, '9/29/2023': 5, '9/30/2023': 5, '10/1/2023': 6, '10/2/2023': 6, '10/3/2023': 6, '10/4/2023': 6, '10/5/2023': 6, '10/6/2023': 6, '10/7/2023': 6, '10/8/2023': 7, '10/9/2023': 7, '10/10/2023': 7, '10/11/2023': 7, '10/12/2023': 7, '10/13/2023': 7, '10/14/2023': 7, '10/15/2023': 8, '10/16/2023': 8, '10/17/2023': 8, '10/18/2023': 8, '10/19/2023': 8, '10/20/2023': 8, '10/21/2023': 8, '10/22/2023': 9, '10/23/2023': 9, '10/24/2023': 9, '10/25/2023': 9, '10/26/2023': 9, '10/27/2023': 9, '10/28/2023': 9, '10/29/2023': 10, '10/30/2023': 10, '10/31/2023': 10, '11/1/2023': 10, '11/2/2023': 10, '11/3/2023': 10, '11/4/2023': 10, '11/5/2023': 11, '11/6/2023': 11, '11/7/2023': 11, '11/8/2023': 11, '11/9/2023': 11, '11/10/2023': 11, '11/11/2023': 11, '11/12/2023': 12, '11/13/2023': 12, '11/14/2023': 12, '11/15/2023': 12, '11/16/2023': 12, '11/17/2023': 12, '11/18/2023': 12, '11/19/2023': 13, '11/20/2023': 13, '11/21/2023': 13, '11/22/2023': 13, '11/23/2023': 13, '11/24/2023': 13, '11/25/2023': 13, '11/26/2023': 14, '11/27/2023': 14, '11/28/2023': 14, '11/29/2023': 14, '11/30/2023': 14, '12/1/2023': 14, '12/2/2023': 14, '12/3/2023': 15, '12/4/2023': 15, '12/5/2023': 15, '12/6/2023': 15, '12/7/2023': 15, '12/8/2023': 15, '12/9/2023': 15, '12/10/2023': 16, '12/11/2023': 16, '12/12/2023': 16, '12/13/2023': 16, '12/14/2023': 16, '12/15/2023': 16, '12/16/2023': 16, '12/17/2023': 17, '12/18/2023': 17, '12/19/2023': 17, '12/20/2023': 17, '12/21/2023': 17, '12/22/2023': 17, '12/23/2023': 17, '12/24/2023': 18, '12/25/2023': 18, '12/26/2023': 18, '12/27/2023': 18, '12/28/2023': 18, '12/29/2023': 18, '12/30/2023': 18, '12/31/2023': 19, '1/1/2024': 19, '1/2/2024': 19, '1/3/2024': 19, '1/4/2024': 19, '1/5/2024': 19, '1/6/2024': 19, '1/7/2024': 20, '1/8/2024': 20, '1/9/2024': 20, '1/10/2024': 20, '1/11/2024': 20, '1/12/2024': 20, '1/13/2024': 20, '1/14/2024': 21, '1/15/2024': 21, '1/16/2024': 21, '1/17/2024': 21, '1/18/2024': 21, '1/19/2024': 21, '1/20/2024': 21, '1/21/2024': 22, '1/22/2024': 22, '1/23/2024': 22, '1/24/2024': 22, '1/25/2024': 22, '1/26/2024': 22, '1/27/2024': 22, '1/28/2024': 23, '1/29/2024': 23, '1/30/2024': 23, '1/31/2024': 23, '2/1/2024': 23, '2/2/2024': 23, '2/3/2024': 23, '2/4/2024': 24, '2/5/2024': 24, '2/6/2024': 24, '2/7/2024': 24, '2/8/2024': 24, '2/9/2024': 24, '2/10/2024': 24, '2/11/2024': 25, '2/12/2024': 25, '2/13/2024': 25, '2/14/2024': 25, '2/15/2024': 25, '2/16/2024': 25, '2/17/2024': 25, '2/18/2024': 26, '2/19/2024': 26, '2/20/2024': 26, '2/21/2024': 26, '2/22/2024': 26, '2/23/2024': 26, '2/24/2024': 26, '2/25/2024': 27, '2/26/2024': 27, '2/27/2024': 27, '2/28/2024': 27, '2/29/2024': 27, '3/1/2024': 27, '3/2/2024': 27, '3/3/2024': 28, '3/4/2024': 28, '3/5/2024': 28, '3/6/2024': 28, '3/7/2024': 28, '3/8/2024': 28, '3/9/2024': 28, '3/10/2024': 29, '3/11/2024': 29, '3/12/2024': 29, '3/13/2024': 29, '3/14/2024': 29, '3/15/2024': 29, '3/16/2024': 29, '3/17/2024': 30, '3/18/2024': 30, '3/19/2024': 30, '3/20/2024': 30, '3/21/2024': 30, '3/22/2024': 30, '3/23/2024': 30, '3/24/2024': 31, '3/25/2024': 31, '3/26/2024': 31, '3/27/2024': 31, '3/28/2024': 31, '3/29/2024': 31, '3/30/2024': 31, '3/31/2024': 32, '4/1/2024': 32, '4/2/2024': 32, '4/3/2024': 32, '4/4/2024': 32, '4/5/2024': 32, '4/6/2024': 32, '4/7/2024': 33, '4/8/2024': 33, '4/9/2024': 33, '4/10/2024': 33, '4/11/2024': 33, '4/12/2024': 33, '4/13/2024': 33, '4/14/2024': 34, '4/15/2024': 34, '4/16/2024': 34, '4/17/2024': 34, '4/18/2024': 34, '4/19/2024': 34, '4/20/2024': 34, '4/21/2024': 35, '4/22/2024': 35, '4/23/2024': 35, '4/24/2024': 35, '4/25/2024': 35, '4/26/2024': 35, '4/27/2024': 35, '4/28/2024': 36, '4/29/2024': 36, '4/30/2024': 36, '5/1/2024': 36, '5/2/2024': 36, '5/3/2024': 36, '5/4/2024': 36, '5/5/2024': 37, '5/6/2024': 37, '5/7/2024': 37, '5/8/2024': 37, '5/9/2024': 37, '5/10/2024': 37, '5/11/2024': 37, '5/12/2024': 38, '5/13/2024': 38, '5/14/2024': 38, '5/15/2024': 38, '5/16/2024': 38, '5/17/2024': 38, '5/18/2024': 38, '5/19/2024': 39, '5/20/2024': 39, '5/21/2024': 39, '5/22/2024': 39, '5/23/2024': 39, '5/24/2024': 39, '5/25/2024': 39, '5/26/2024': 40, '5/27/2024': 40, '5/28/2024': 40, '5/29/2024': 40, '5/30/2024': 40, '5/31/2024': 40, '6/1/2024': 40, '6/2/2024': 41, '6/3/2024': 41, '6/4/2024': 41, '6/5/2024': 41, '6/6/2024': 41, '6/7/2024': 41, '6/8/2024': 41, '6/9/2024': 42, '6/10/2024': 42, '6/11/2024': 42, '6/12/2024': 42, '6/13/2024': 42, '6/14/2024': 42, '6/15/2024': 42, '6/16/2024': 43, '6/17/2024': 43, '6/18/2024': 43, '6/19/2024': 43, '6/20/2024': 43, '6/21/2024': 43, '6/22/2024': 43, '6/23/2024': 44, '6/24/2024': 44, '6/25/2024': 44, '6/26/2024': 44, '6/27/2024': 44, '6/28/2024': 44, '6/29/2024': 44, '6/30/2024': 45, '7/1/2024': 45, '7/2/2024': 45, '7/3/2024': 45, '7/4/2024': 45, '7/5/2024': 45, '7/6/2024': 45, '7/7/2024': 46, '7/8/2024': 46, '7/9/2024': 46, '7/10/2024': 46, '7/11/2024': 46, '7/12/2024': 46, '7/13/2024': 46, '7/14/2024': 47, '7/15/2024': 47, '7/16/2024': 47, '7/17/2024': 47, '7/18/2024': 47, '7/19/2024': 47, '7/20/2024': 47, '7/21/2024': 48, '7/22/2024': 48, '7/23/2024': 48, '7/24/2024': 48, '7/25/2024': 48, '7/26/2024': 48, '7/27/2024': 48, '7/28/2024': 49, '7/29/2024': 49, '7/30/2024': 49, '7/31/2024': 49, '8/1/2024': 49, '8/2/2024': 49, '8/3/2024': 49, '8/4/2024': 50, '8/5/2024': 50, '8/6/2024': 50, '8/7/2024': 50, '8/8/2024': 50, '8/9/2024': 50, '8/10/2024': 50, '8/11/2024': 51, '8/12/2024': 51, '8/13/2024': 51, '8/14/2024': 51, '8/15/2024': 51, '8/16/2024': 51, '8/17/2024': 51, '8/18/2024': 52, '8/19/2024': 52, '8/20/2024': 52, '8/21/2024': 52, '8/22/2024': 52, '8/23/2024': 52, '8/24/2024': 52, '8/25/2024': 53, '8/26/2024': 53, '8/27/2024': 53, '8/28/2024': 53, '8/29/2024': 53, '8/30/2024': 53, '8/31/2024': 52
  };

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
   * @param {Number} columnNumber
   * @returns String
   */
  static getColumnByNumber(columnNumber) {

    let columnResult = '';





    return 'A';
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

    const searchString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const week = Util.dates[searchString];
    return week;
  }

  static textToFlagInt(flagText) {
    let flagInt = -1;

    switch (flagText) {
      case 'Report':
        flagInt = 0;
        break;

      case 'Completed':
        flagInt = 1;
        break;

      case 'Risk':
        flagInt = 2;
        break;

      default:
        flagInt = -1;
        break;
    }
    return flagInt;
  }

  static intToFlagText(flagInt) {
    let flagText = '';

    switch (flagInt) {
      case 0:
        flagText = 'Report';
        break;

      case 1:
        flagText = 'Completed';
        break;

      case 2:
        flagText = 'Risk';
        break;

      default:
        flagText = '';
        break;
    }
    return flagText;
  }

  static textToStatusInt(statusText) {
    let statusInt = -1;

    statusText = statusText.toLowerCase();


    switch (statusText) {
      case 'not started':
        statusInt = 0;
        break;

      case 'in work':
        statusInt = 1;
        break;

      case 'completed':
        statusInt = 2;
        break;

      case 'on hold':
        statusInt = 3
        break;

      case 'cancelled':
        statusInt = 4;
        break;

      default:
        statusInt = -1;
        break;
    }

    return statusInt;
  }

  static textToWorkStatusInt(workStatusText) {
    let workStatusInt = -1;

    switch (workStatusText) {
      case 'On Track':
        workStatusInt = 0;
        break;

      case 'Behind':
        workStatusInt = 1;
        break;

      case 'Out of Track':
        workStatusInt = 2;
        break;

      default:
        workStatusInt = -1;
        break;
    }

    return workStatusInt;
  }

  static intToWorkStatusText(workStatusInt) {
    let workStatusText = '';

    switch (workStatusInt) {
      case 0:
        workStatusText = 'On Track';
        break;

      case 1:
        workStatusText = 'Behind';
        break;

      case 2:
        workStatusText = 'Out of Track';
        break;

      default:
        workStatusText = '';
        break;
    }

    return workStatusText;
  }

  static isOnTime(task, type) {

    const timeResult = {
      onTime: false,
      timeBehind: 0,
      unit: ''
    };

    if (task.progress >= 1 || task.status === 2) {
      timeResult.onTime = true;
      timeResult.timeBehind = 0;
      return timeResult;
    }

    if (task.duration === -1) {
      timeResult.onTime = true;
      timeResult.timeBehind = 0;
      return timeResult;
    }

    if (type === 0) {

      const currentWeek = Util.dateToWeek(new Date());
      
      const ranges = [];

      const expectedProgress = 1 / task.duration;

      let sum = 0;

      for (let i = 0; i < task.duration; i++) {
        sum += expectedProgress;
        ranges.push(sum);
      }

      let progressStage = 0;

      for (let i = 0; i < ranges.length; i++) {
        let previousRange = 0;

        if (i === 0) {
          previousRange = 0;
        } else {
          previousRange = ranges[i - 1];
        }

        if (task.progress >= previousRange && task.progress <= ranges[i]) {
          progressStage = i;
        }
      }

      const relativeDate = currentWeek - task.startDate.week;

      if (progressStage < relativeDate) {
        timeResult.onTime = false;
        timeResult.timeBehind = relativeDate - progressStage;
        timeResult.unit = 'weeks';
      } else {
        timeResult.onTime = true;
        timeResult.timeBehind = relativeDate - progressStage;
        timeResult.unit = 'weeks';
      }

    } else {

      const dayUnit = 1000 * 60 * 60 * 24;

      const currentDate = new Date();

      const ranges = [];

      const expectedProgress = 1 / task.duration;

      let sum = 0;

      for (let i = 0; i < task.duration; i++) {
        sum += expectedProgress;
        ranges.push(sum);
      }

      let progressStage = 0;

      for (let i = 0; i < ranges.length; i++) {
        let previousRange = 0;

        if (i === 0) {
          previousRange = 0;
        } else {
          previousRange = ranges[i - 1];
        }

        if (task.progress >= previousRange && task.previousRange <= ranges[i]) {
          progressStage = i;
        }
      }
      
      const relativeDate = Math.ceil((currentDate - task.startDate.date) / dayUnit);

      if (progressStage < relativeDate) {
        timeResult.onTime = false;
        timeResult.timeBehind = relativeDate - progressStage;
        timeResult.unit = 'days';
      } else {
        timeResult.onTime = true;
        timeResult.timeBehind = relativeDate - progressStage;
        timeResult.unit = 'days';
      }
    }


    return timeResult;
  }
}


module.exports = Util;