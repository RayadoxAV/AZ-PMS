const { ipcMain } = require('electron');
const Logger = require('../util/Logger');
const { Workplan } = require('./types');
const { Workbook, Worksheet, FormulaType } = require('exceljs');
const Util = require('../util/util');

class DataExtractor {

  /**
   * Evaluate the sheets of a Workbook to verify if any are a valid workplan given an ID
   * @param {String} projectId An ID to search inside the Workbook
   * @param {Workbook} workbook A workbook
   * @returns {(Number|{ error: string })} The sheet with the corresponding workplan or null
   */
  evaluateSheets(projectId, workbook) {

    if (!projectId) {

      Logger.Log(`No project id specified for workbook '${workbook.name}'`, 2)
    }

    let workplanScore = 0;
    let hasValidId = false;
    let sheetIndex = 0;

    let validSheetIndex = -1;

    const t0 = performance.now();

    workbook.eachSheet((worksheet) => {
      workplanScore = 0;
      hasValidId = false;
      const cells = Util.getRange(worksheet, 'A1:V10');

      const rowOffset = 22; // Calculated on the size of the range A - V = 22

      for (let i = 0; i < cells.length; i++) {
        const currentValue = `${cells[i].value}`.toLowerCase();


        if (currentValue === 'workplan' ||
          currentValue === 'project id' ||
          currentValue === 'project name' ||
          currentValue === 'project objective' ||
          currentValue === 'task' ||
          currentValue === 'responsible' ||
          currentValue === 'status' ||
          currentValue === 'progress') {
          workplanScore++;
        }

        if (currentValue === 'project id') {
          if (cells[i + rowOffset].value === projectId) {
            hasValidId = true;
          }
        }

        if (cells[i].mergedCount > 0) {
          console.log(cells[i].address);
          i += cells[i].mergedCount
        }

      }

      if (workplanScore >= 7 && hasValidId) {
        validSheetIndex = sheetIndex;
      } else if (!projectId && workplanScore >= 7) {
        validSheetIndex = sheetIndex;
      }
      sheetIndex++;
    });

    if (process.env.PERFORMANCE_METRICS === 'on') {
      const t1 = performance.now() - t0;
      Logger.Log(`Evaluated ${workbook.worksheets.length} sheets in ${t1}ms`, 0);
    }

    if (validSheetIndex === -1) {
      return {
        error: 'File does not contain a valid workplan'
      };
    }

    return workbook.worksheets[validSheetIndex];
  }

  /**
   * 
   * @param {ExcelJS.Worksheet} workplanSheet 
   */
  getWorkplanVersion(workplanSheet) {

    let version = '';

    const cells = Util.getRange(workplanSheet, 'A1:V10');

    const workplanFieldsMap = new Map();

    for (let i = 0; i < cells.length; i++) {
      if (typeof cells[i].value === 'string') {
        const workplanField = `${cells[i].value}`.toLocaleLowerCase();

        // console.log(workplanField);
        for (let j = 0; j < Util.testFields.length; j++) {
          if (workplanField === Util.testFields[j]) {
            if (workplanFieldsMap.has('remarks') && workplanField === 'remarks') {
              workplanFieldsMap.set('remarks [project]', 7);
            }

            if (!workplanFieldsMap.has(workplanField)) {
              workplanFieldsMap.set(workplanField, j);
            }
          }
        }
      }
    }

    const fieldIndices = [];

    for (let field of workplanFieldsMap.values()) {
      fieldIndices.push(field);
    }

    fieldIndices.sort((a, b) => a - b);

    let matchesV3 = 0;
    let matchesV2 = 0;
    let matchesV1_5 = 0;

    for (let i = 0; i < fieldIndices.length; i++) {

      if (Util.v3Fields.includes(fieldIndices[i])) {
        matchesV3++;
      }

      if (Util.v2Fields.includes(fieldIndices[i])) {
        matchesV2++;
      }

      if (Util.v1_5Fields.includes(fieldIndices[i])) {
        matchesV1_5++;
      }
    }

    if (fieldIndices.includes(15)) {
      matchesV3 += 2;
    }

    if (matchesV3 === Util.V3RequiredMatches) {
      version = 'v3';
    } else if (matchesV2 === Util.V2RequiredMatches) {
      version = 'v2';
    } else if (matchesV1_5 = Util.v1_5RequiredMatches) {
      version = 'v1.5';
    } else {
      version = '';
    }
    // console.log(fieldIndices);
    // console.log('V3', matchesV3, Util.V3RequiredMatches);
    // console.log('V2', matchesV2, Util.V2RequiredMatches);
    // console.log('V1_5', matchesV1_5, Util.v1_5RequiredMatches);

    Logger.Log(`Workplan evaluated to version ${version}`, 0);

    return [version, fieldIndices];
  }

  /**
   * @param {ExcelJS.Worksheet} workplanSheet
   * @returns {number} 0 Workplan weekly, 1 Workplan Daily, 2 Workplan SCRUM
  */
  getWorkplanType(workplanVersion, workplanFields) {
    let workplanType = -1;

    const scrumFields = [28, 29, 30, 32, 33, 34, 35, 36];


    for (let i = 0; i < scrumFields.length; i++) {
      if (workplanFields.includes(scrumFields[i])) {
        workplanType = 2;
        Logger.Log(`Workplan evaluated to type ${workplanType}`, 0);
        return workplanType;
      }
    }

    if (workplanFields.includes(15)) {
      workplanType = 1;
    } else {
      workplanType = 0;
    }

    Logger.Log(`Workplan evaluated to type ${workplanType}`, 0);

    return workplanType;
  }

  /**
   * 
   * @param {Map} bridge 
   * @param {ExcelJS.Worksheet} workplanSheet 
   * @param {String} version 
   * @param {Number} type 
   * @returns 
   */
  getProjectData(bridge, workplanSheet, version, type) {

    const projectData = {};
    
    if (version === 'v3') {
        projectData.projectId = Util.getValueForCell(0, workplanSheet, bridge);
        projectData.projectName = Util.getValueForCell(1, workplanSheet, bridge);
        projectData.projectObjective = Util.getValueForCell(2, workplanSheet, bridge);
        projectData.projectOwner = Util.getValueForCell(3, workplanSheet, bridge);
        projectData.projectRemarks = Util.getValueForCell(7, workplanSheet, bridge);
        projectData.projectProgress = Util.getValueForCell(4, workplanSheet, bridge);

      if (type === 0) {
        projectData.projectStartDate = {
          date: Util.weekToDate( Util.getValueForCell(6, workplanSheet, bridge) )[0],
          week: Util.getValueForCell(6, workplanSheet, bridge)
        };
      } else if (type === 1) {
        console.log(Util.getValueForCell(6, workplanSheet, bridge));
        projectData.projectStartDate = {
          date: new Date(Util.getValueForCell(6, workplanSheet, bridge) + 21600000);
          week: Util.dateToWeek()[0]
        };
      } else if (type === 2) {
        console.log(Util.getValueForCell(6, workplanSheet, bridge));
        // projectData.
      }

    } else if (version === 'v2') {
      projectData
    } else if (version === 'v1_5') {

    }

    console.log(projectData);

    return projectData;
  }

  getMilestoneData(bridge, workplanSheet) {

  }

  getTaskData(bridge, workplanSheet) {

  }

}

module.exports = DataExtractor;
