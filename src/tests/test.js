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

  console.log(report);

  return [workplanVersion, workplanType];
}

async function test() {

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

test();