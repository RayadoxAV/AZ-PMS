/* 
  Raymundo Paz
  March 2024
*/

// import { LogType, Logger } from '../src/util/logger';
import { DataCollector } from '../src/data/processing/dataCollector';

import 'dotenv/config';
import { LogType, Logger } from '../src/util/logger';

declare global {
  var shared: any;
}

function handleTests() {

  const testFunction = process.argv[2].substring(2);

  if (!testFunction) {
    Logger.log('Not enough arguments', LogType.ERROR);
    return;
  }


  switch (testFunction) {
    case 'dataCollector.provideWorkbook': {
      test(testFunction, testDataCollectorProvideWorkbook, undefined, 26);
      break;
    }

    default:
      test('dataCollector.provideWorkbook', testDataCollectorProvideWorkbook, undefined, 26);
      break;
  }


}

handleTests();

function test(name: string, method: Function, args: any, expectedValue: any) {
  const result = method(args);

  const message = `${name} -> ${expectedValue === result ? 'PASSED ✅' : `FAILED ❌ >> Expected: ${expectedValue} - Got: ${result}`}`;
  Logger.log(message, LogType.TEST);
}

function testDataCollectorProvideWorkbook() {
  const workplans = [
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-1.New Hires Process_WP FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-3.Link unmapped veh_WP FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-4.VINtelligence - Non mapped vehicles_WP FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-5.Requirements for VINtelligence tool_WP FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-6.Weekly Report for Support.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-7.VIN-telligence Tool Workplan.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-8.Mdl_Codes_Recycling_WP FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-9.Affinity.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-10.Fix Finder.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-11.Define Admin roles and processes.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/ADM-12.Define plan for transition in tasks.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/BA-1.AutoZone MDM BI & Reporting Services.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/BR-1.Part Type Standardization Brazil.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/BR-2.Coverage Motorcycles Brazil.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/MERCH-1 Backup.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/MERCH-1_MDM MX Implementation.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/MIID-13_Ecomm Batch Samples.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/PI-3_Ecomm Titles into PIC.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/Pj. Most Popular vehicles Report & Automation Workplan.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/Pj. Unauthorized PTs Workplan.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/PR-4.MX Onboarding Roadmap.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/SUPP-5.Legacy Retirement FY24.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/TST-1 Testing WP.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/TST-2 Testing WP Scrum.xlsx', 'MERCH-1', '' ],
    // [ 'C:/users/rpaz/documents/testing/az_pms/TST-3 Recurring tasks.xlsx', 'MERCH-1', '' ],
    [ 'C:/users/rpaz/documents/testing/az_pms/values.xlsx', 'MERCH-1', '' ],
  ];

  let expectedSolutions = 0;
  for (let i = 0; i < workplans.length; i++) {
    const result = new DataCollector().provideWorkbook(workplans[i]);
    result.then((value) => {
      console.log(JSON.stringify(value));
    });
    expectedSolutions += 1;
  }

  return expectedSolutions;
}