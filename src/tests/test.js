/* 
  Author: Raymundo Paz
  Date: 12/29/2023
  Integration test
*/
require('dotenv').config();

const Logger = require('../util/Logger');
const DataExtractor = require('../data/dataExtractor');
const WorkbookProvider = require('../data/workbookProvider');
const BridgeProvider = require('../data/bridgeProvider');

const { Workplan } = require('../data/types');
const { InferenceEngine } = require('../data/inferenceEngine');
const Util = require('../util/util');
const { PersistenceManager } = require('../data/persistenceManager');

async function testExtraction(path, projectId) {

  const dataExtractor = new DataExtractor();


  // TODO: this is provided by args
  // const path = 'C:/users/rpaz/documents/testing/az_pms/MERCH-1 Backup.xlsx';
  // const projectId = 'MERCH-1';

  const workbookProvider = new WorkbookProvider();

  const workbook = await workbookProvider.provideWorkbook(path);
  workbook.name = path.split('/').pop();
  if (workbook.error) {
    // TODO: Emit error event to frontend
    return [undefined, undefined];
  }

  const workplanSheet = dataExtractor.evaluateSheets(projectId, workbook);
  if (workplanSheet.error) {
    // TODO: Emit error event to frontend
    return [undefined, undefined];
  }

  const [workplanVersion, fields] = dataExtractor.getWorkplanVersion(workplanSheet);

  if (!workplanVersion) {
    // TODO: Emit error event to frontend
    return [undefined, undefined];
  }

  const workplanType = dataExtractor.getWorkplanType(workplanVersion, fields);

  const bridgeProvider = new BridgeProvider();

  const bridge = bridgeProvider.provideBridge(fields, workplanSheet);

  if (!bridge) {
    // TODO: Emit error event to frontend. Theorically there is no reason for this to fail, and if it does, it must be a fatal error so there is no point, but whatever.
    return;
  }

  const workplan = new Workplan();
  workplan.pathOrURL = path;
  workplan.version = workplanVersion;
  workplan.type = workplanType;

  const projectData = dataExtractor.getProjectData(bridge, workplanSheet, workplan.version, workplan.type);

  Object.assign(workplan, projectData);

  const milestoneData = dataExtractor.getMilestoneData(bridge, workplanSheet, workplan.type, workplan.version);

  // console.log(milestoneData);

  workplan.milestones = [...milestoneData];

  const inferenceEngine = new InferenceEngine();

  const inferences = inferenceEngine.infer(workplan);

  const report = inferenceEngine.generateReport(workplan);

  // console.log(report);

  return [workplanVersion, workplanType];
}

async function testDataExtraction() {

  const testCases = [
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-1.New Hires Process_WP FY24.xlsx',
      projectId: 'ADM-1',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-3.Link unmapped veh_WP FY24.xlsx',
      projectId: 'ADM-3',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-4.VINtelligence - Non mapped vehicles_WP FY24.xlsx',
      projectId: 'ADM-4',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-5.Requirements for VINtelligence tool_WP FY24.xlsx',
      projectId: 'ADM-5',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-6.Weekly Report for Support.xlsx',
      projectId: 'ADM-6',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-7.VIN-telligence Tool Workplan.xlsx',
      projectId: 'ADM-7',
      expectedVersion: 'v3',
      expectedType: 2
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-8.Mdl_Codes_Recycling_WP FY24.xlsx',
      projectId: 'ADM-8',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-9.Affinity.xlsx',
      projectId: 'ADM-9',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/ADM-10.Fix Finder.xlsx',
      projectId: 'ADM-10',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/BR-1.Part Type Standardization Brazil.xlsx',
      projectId: 'BR-1',
      expectedVersion: 'v1.5',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/MERCH-1 Backup.xlsx',
      projectId: 'MERCH-1',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/MERCH-1 Backup.xlsx',
      projectId: 'CAT-1',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/MERCH-1 Backup.xlsx',
      projectId: 'PI-4',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/MERCH-1 Backup.xlsx',
      projectId: 'PR-7',
      expectedVersion: 'v3',
      expectedType: 0
    },
    {
      path: 'C:/Users/rpaz/Documents/testing/az_pms/Pj. Most Popular vehicles Report & Automation Workplan.xlsx',
      projectId: 'MCD-2544',
      expectedVersion: 'v3',
      expectedType: 2
    }
  ];

  for (let testcase of testCases) {
    console.log(testcase.projectId);

    const [version, type] = await testExtraction(testcase.path, testcase.projectId);
    // Logger.Log(`---${testcase.projectId}---`, 0);
    if (testcase.expectedVersion === version) {
      Logger.Log(`\t Version -> PASS - ${testcase.expectedVersion} vs ${version}`, 1);
    } else {
      Logger.Log(`\t Version -> FAILED - ${testcase.expectedVersion} vs ${version}`, 3);
    }

    if (testcase.expectedType === type) {
      Logger.Log(`\t Type -> PASS - ${testcase.expectedType} vs ${type}`, 1);
    } else {
      Logger.Log(`\t Type -> FAILED - ${testcase.expectedType} vs ${type}`, 3);
    }
    console.log();
    console.log();
  }


}

async function testDB() {
  // const created = await PersistenceManager.createDBIfNotExists();
  // const db = await PersistenceManager.readDBFile();

  // customAssert(false, created, 'Create database');
  // customAssert(1, db.meta.version, 'Read database');



  // console.log('Method: PersistenceManager.searchInDB');
  // const noProjectResult = await PersistenceManager.searchInDB('TST-2', '1. Some test');
  // const noActivityResult = await PersistenceManager.searchInDB('TST-1', '1. Non existent');
  // const activityResult = await PersistenceManager.searchInDB('TST-1', '1. Some test');

  // const wrongTypeProjectResult = await PersistenceManager.searchInDB({}, '1. Some test');
  // const wrongTypeActivityResult = await PersistenceManager.searchInDB('TST-1', {});

  // customAssert(undefined, noProjectResult, 'Search in non existent project');
  // customAssert(undefined, noActivityResult, 'Search non existent activity in project');
  
  // customAssert('1. Some test', activityResult.name, 'Search: Existent activity name');
  // customAssert(0.2, activityResult.progress, 'Search: Existent activity progress');
  // customAssert(21, activityResult.lastReportDate.week, 'Search: Existent activity week');
  // customAssert('2024-01-15', activityResult.lastReportDate.date, 'Search: Existent activity date');

  // customAssert(undefined, wrongTypeProjectResult, 'Search: Wrong type - Project');
  // customAssert(undefined, wrongTypeActivityResult, 'Search: Wrong type - Activity');

  // console.log('Method: PersistenceManager.addToDB');
  // const activityOnNoProject = await PersistenceManager.addToDB('TST-2', '2. Some activity', 0.5);
  // const [addedActivity] = await PersistenceManager.addToDB('TST-1', '2. Some activity', 0.5);
  // customAssert(0.5, addedActivity.progress, 'Added activity progress');
  // customAssert(21, addedActivity.lastReportDate.week, 'Added activity week');
  // customAssert('2024-01-15', addedActivity.lastReportDate.date, 'Added activity date');

  // customAssert(undefined, undefined, 'Add activity on non-existen project');
  // customAssert('2. Some activity', addedActivity.name, 'Added activity name');

  // const removedActivity = await PersistenceManager.deleteFromDB('TST-1', '2. Some activity');
  // customAssert(true, removedActivity, 'Remove activity from project');

  // const noRemovedActivity = await PersistenceManager.deleteFromDB('TST-1', '5. Some other activity');
  // customAssert(false, noRemovedActivity, 'Remove non-existent activity');
 
  // const noRemovedActivityProject = await PersistenceManager.deleteFromDB('TST-5', '2. Some activity');
  // customAssert(false, noRemovedActivityProject, 'Remove activity from non-existent project');
  
  /* const newEntry = {
    type: 'task',
    name: '1. Some other name',
    actualDate: {

    }
  };
 */
  // await PersistenceManager.addToDB('TST-1', newEntry, 'task');
  // const updatedActivity = await PersistenceManager.updateFromDB('TST-1', '1. Some test', newActivity);

  // customAssert(true, updatedActivity, 'Update existent activity');

  // const noUpdatedActivity = await PersistenceManager.updateFromDB('TST-1', '1. Asa', newActivity);
  // const noUpdatedActivityProject = await PersistenceManager.updateFromDB('TSTA-1', '1. Some test', newActivity);

  // customAssert(false, noUpdatedActivity, 'Update non-existent activity');
  // customAssert(false, noUpdatedActivityProject, 'Update existent activity from non-existent project');


}


function determineTests() {
  const moduleArg = process.argv[2];

  if (moduleArg) {
    if (moduleArg.includes('-m=')) {
      const target = moduleArg.split('=')[1];

      if (target) {

        switch (target) {
          case 'data':
            testDataExtraction();
            break;

          case 'd':
            testDataExtraction();
            break;

          case 'bd':
            testDB();
            break;

          case 'db':
            testDB();
            break;

          default:
            Logger.Log(`Unknown target for function 'test': '${target}'`, 3);
            break;
        }

      } else {
        Logger.Log(`Unknown target for function 'test': '${target}'`, 3);
      }

    } else {
      Logger.Log(`Unknown arguments for function 'test': ${moduleArg}`, 3);
    }
  } else {
    Logger.Log('Insufficient arguments for function \'test\'', 3);
  }
}

determineTests();

function customAssert(expectedValue, actualValue, caseName) {

  if (typeof expectedValue === 'object') {
    Logger.Log(`Assertion failed for case ${caseName}: Cannot assert values of type [object]`, 10);
    return;
  }


  if (expectedValue === actualValue) {
    Logger.Log(`${caseName}: PASS ✅`, 10)
  } else {
    Logger.Log(`${caseName}: FAIL ❌`, 10);
  }
}