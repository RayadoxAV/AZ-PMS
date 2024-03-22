/* 
  Raymundo Paz
  March 2024
*/

import { PerformanceMeter } from '../../util/performanceMeter';
import { CustomWorksheet } from '../data';

export class DataTransformator {
  public sheetToWorkplan(inputSheet: CustomWorksheet): void {
    const perfMeter = new PerformanceMeter();
    perfMeter.start();

    /* Steps for the conversion:
      1. Determine the Workplan Version (1, 2, 3) and the Workplan Type (Daily, Scrum , Weekly)
        1.1
        1.2
        1.3
      2. Basing us on the version and type, we generate a bridge that tells us where to find all the relevant data.
        2.1
        2.2
        2.3
      3. Iterate over all of the bridge entries to get the project data.
        3.1
        3.2
        3.3
      4. Search and generate all the milestones
        4.1 Iterate over the rows that are inside of the Milestone range and look for the Milestone color (#d6dce4)
        4.2 Take as much fields as needed.
        4.3
      5. Search and generate all the tasks.
        5.1
        5.2
        5.3
      6. Calculate Work Status, Time Status and other calculated fields
        6.1
        6.2
        6.3
    */

    perfMeter.end();
    perfMeter.log('Worksheet into Workplan transformation');
  }
}
