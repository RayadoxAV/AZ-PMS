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
    return;
  }

  const workplanSheet = dataExtractor.evaluateSheets(projectId, workbook);

  if (workplanSheet.error) {
    console.log(workplanSheet.error);
    // TODO: Emit error event to frontend
    return;
  }

  const [workplanVersion, fields] = dataExtractor.getWorkplanVersion(workplanSheet);

  if (!workplanVersion) {
    // TODO: Emit error event to frontend
    return;
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

  const milestoneData = dataExtractor.getMilestoneData(bridge, workplanSheet, workplan.type, workplan.version, );

  workplan.milestones = [...milestoneData];

  const inferenceEngine = new InferenceEngine();

  const inferences = inferenceEngine.infer(workplan);

  return [workplanVersion, workplanType];
}

async function test() {
  const testCases = [
    { path: 'C:/users/rpaz/documents/testing/az_pms/MERCH-1 Backup.xlsx', projectId: 'PR-7', 
    expectedVersion: 'v3', expectedType: 0 },
    // { path: 'C:/users/rpaz/documents/testing/az_pms/PR-4.MX Onboarding Roadmap.xlsx', projectId: 'PR-4',
    // expectedVersion: 'v2', expectedType: 0 },
    // { path: 'C:/users/rpaz/documents/testing/az_pms/Pj. Unauthorized PTs Workplan.xlsx', projectId: '',
    // expectedVersion: 'v1.5', expectedType: 2 },
    // { path: 'C:/users/rpaz/documents/testing/az_pms/BR-1.Part Type Standardization Brazil.xlsx', projectId: '',
    // expectedVersion: 'v1.5', expectedType: 0 },
    // { path: 'C:/users/rpaz/documents/testing/az_pms/Pj. Most Popular vehicles Report & Automation Workplan.xlsx', projectId: 'MCD-2544',
    // expectedVersion: 'v3', expectedType: 2 }
  ];

  for (let testcase of testCases) {
    const [version, type] = await testExtraction(testcase.path, testcase.projectId);
    console.log();
    // Logger.Log(`---${testcase.projectId}---`, 0);
    // if (testcase.expectedVersion === version) {
    //   Logger.Log(`\t Version -> PASS - ${testcase.expectedVersion} vs ${version}`, 1);
    // } else {
    //   Logger.Log(`\t Version -> FAILED - ${testcase.expectedVersion} vs ${version}`, 3);
    // }

    // if (testcase.expectedType === type) {
    //   Logger.Log(`\t Type -> PASS - ${testcase.expectedType} vs ${type}`, 1);
    // } else {
    //   Logger.Log(`\t Type -> FAILED - ${testcase.expectedType} vs ${type}`, 3);
    // }
  }

}

test();