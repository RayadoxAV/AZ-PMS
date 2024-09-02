import { getFiscalWeek } from '../util/util';
import { Flag, Status, CellType, Label, Duration, WPDate, CellError, TimeStatus, TimelineDeviation } from '../util/misc';

export class CustomWorkbook {
  public name: string;
  public path: string;
  public link: string;
  public sheets: CustomWorksheet[];

  constructor() {
    this.name = '';
    this.path = '';
    this.link = '';
    this.sheets = [];
  }
}

export class CustomWorksheet {
  public name: string;
  public rows: CustomRow[];
  public cells: CustomCell[];

  constructor() {
    this.name = '';
    this.rows = [];
    this.cells = [];
  }

  public getRange(range: string): CustomCell[] {

    let [startCell, endCell] = range.split(':');

    if (endCell < startCell) {
      const temp = endCell;
      endCell = startCell;
      startCell = temp;
    }

    const startResult = startCell.match(/[a-z]+|[^a-z]+/gi);
    let startCellColumn = startResult[0];
    const startRow = startResult[1];

    const endResult = endCell.match(/[a-z]+|[^a-z]+/gi);
    let endCellColumn = endResult[0];
    const endRow = endResult[1];

    let startRowNumber = Number.parseInt(startRow);
    let endRowNumber = Number.parseInt(endRow);

    if (endCellColumn < startCellColumn) {
      const temp = endCellColumn;
      endCellColumn = startCellColumn;
      startCellColumn = temp;
    }
    if (endRowNumber < startRowNumber) {
      console.log('should not happen here');
      const temp = endRowNumber;
      endRowNumber = startRowNumber;
      startRowNumber = temp;
    }

    const resultCells: CustomCell[] = [];

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (row.rowNumber >= startRowNumber && row.rowNumber <= endRowNumber) {
        
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          const [ cellCol ] = cell.address.match(/[a-z]+|[^a-z]+/gi);
          
          if (cellCol >= startCellColumn && cellCol <= endCellColumn) {
            resultCells.push(cell);
          }
        }
      }
    }

    return resultCells;
  }

  public getCell(address: string): CustomCell {
    
    const [column, rowString] = address.match(/[a-z]+|[^a-z]+/gi);

    const rowNumber = Number.parseInt(rowString);

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      
      if (row.rowNumber === rowNumber) {
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];

          if (cell.colName === column) {
            return cell;
          }
        }
      }
    }
    const notFoundCell = new CustomCell();
    notFoundCell.value = undefined;

    return notFoundCell;
  }

  public getRow(rowNumber: number): CustomRow {
    for (let i = 0 ; i < this.rows.length; i++) {
      const row = this.rows[i];

      if (row.rowNumber === rowNumber) {
        return row;
      }
    }
  }

}

export class CustomRow {
  public rowNumber: number;
  public cells: CustomCell[];

  constructor() {
    this.rowNumber = -1;
    this.cells = [];
  }
}

export class CustomCell {
  public rowNumber: number;
  public colName: string;
  public address: string;
  public value: number | string | boolean | Date| CellError;
  public type: CellType;

  constructor() {
    this.rowNumber = -1;
    this.colName = '';
    this.address = '';
    this.value = undefined;
    this.type = undefined;
  }
}



export class Milestone {
  public flag: Flag;
  public label?: Label;
  public number: string;
  public name: string;
  public jiraId?: string;
  public responsible?: string;
  public status: Status;
  public progress: number;
  public storyPoints?: number;
  public duration: Duration;
  public startDate: WPDate;
  public finishDate: WPDate;
  public newFinishDate: WPDate;
  public actualDate: WPDate;
  public predecessor?: string;
  public completedCount?: number;
  public targetCount?: number;
  public remainingCount?: number;
  public receivedLastWeekCount?: number;
  public workedLastWeekCount?: number;
  public remarks: string;
  public comments: string;
  public lastUpdated: WPDate;
  public tasks: Task[];

  constructor() {
    this.tasks = [];
  }
}

export class Task {
  public flag: Flag;
  public label?: Label;
  public number: string;
  public name: string;
  public jiraId?: string;
  public responsible: string;
  public status: Status;
  public progress: number;
  public storyPoints?: number;
  public duration: Duration;
  public startDate: WPDate;
  public finishDate: WPDate;
  public newFinishDate: WPDate;
  public actualDate: WPDate;
  public predecessor?: string;
  public completedCount?: number;
  public targetCount?: number;
  public remainingCount?: number;
  public receivedLastWeekCount?: number;
  public workedLastWeekCount?: number;
  public remarks: string;
  public comments: string;
  public lastUpdated: WPDate;
  public subtasks: Task[];

  public timeStatus: TimeStatus;
  public timelineDeviation: TimelineDeviation;

  constructor() {
    this.subtasks = [];
  }

  toString(): string {
    return `Task [${this.number} ${this.name} -> ${JSON.stringify(this.duration)}]`;
  }

  public calculateDuration(): boolean {
    /* console.log(this.startDate.date.toString());
    console.log(this.finishDate.date.toString());
    console.log(this.newFinishDate.date.toString());
    console.log('--------'); */

    if (this.startDate.weekNo !== -0xFF && ( this.finishDate.weekNo !== -0xFF || this.newFinishDate.weekNo !== -0xFF )) {
      
      const finishDate = this.finishDate.weekNo !== -0xFF ? this.finishDate : this.newFinishDate;
      const duration: Duration = {
        weeks: ( finishDate.weekNo - this.startDate.weekNo + 1),
        days: ((finishDate.date.getTime() - this.startDate.date.getTime()) / 86400000) + 1
      };

      if (duration.weeks === this.duration.weeks && duration.days === this.duration.days) {
        return true;
      } else {
        this.duration = duration;
        return false;
      }
    }

    return true;
  }

  // TEST: Write test
  public calculateDeviation(dateAndDurationFormat: number) {
    const timelineDevation: TimelineDeviation = {
      isOnTime: true,
      timeline: {
        weeks: 0,
        days: 0
      }
    };

    this.timelineDeviation = timelineDevation;

    if (this.progress >= 1 || this.status === Status.Completed) {
      // console.log(this.name, 'Completed');
      return;
    }

    if (this.status === Status.Cancelled) {
      // console.log(this.name, 'Cancelled');
      return;
    }
    
    if (this.status === Status.NotStarted) {
      // console.log(this.name, 'Not Started');
      return;
    }

    if (this.duration.days === -0xFF) {
      // console.log(this.name, 'No Duration ');
      return;
    }

    if (this.startDate.weekNo === -0xFF) {
      // console.log(this.name, 'No Start Date');
      return;
    }

    if (this.flag === Flag.Recurrent || this.flag === Flag.RecurrentReport) {
      // console.log(this.name, 'Recurrent');
      return;
    }

    if (dateAndDurationFormat === 0) {

      const taskDuration = this.duration.weeks;
      
      const progressUnit = 1 / taskDuration;
      let accumulatedProgress = progressUnit;

      const ranges = new Array(taskDuration);

      for (let i = 0; i < ranges.length; i++) {
        ranges[i] = Number.parseFloat(accumulatedProgress.toFixed(3));
        accumulatedProgress += progressUnit;
      }

      const currentWeek = getFiscalWeek(new Date());

      const currentWeekIndex = currentWeek - this.startDate.weekNo;

      let rangeIndex = -1;
      let previousRange = 0;

      for (let i = 0; i < ranges.length; i++) {
        if (i === 0) {
          previousRange = -0.1;
        } else {
          previousRange = ranges[i - 1];
        }

        if (this.progress > previousRange && this.progress <= ranges[i]) {
          rangeIndex = i;
          break;
        }
      }

      if (currentWeekIndex > ranges.length) {
        timelineDevation.isOnTime = false;
        timelineDevation.timeline = {
          weeks: currentWeekIndex - rangeIndex,
          days: (currentWeek - rangeIndex) * 5
        };
        this.timelineDeviation = timelineDevation;
        return;
      }
 
      const progressDifference = currentWeekIndex - rangeIndex;

      if (progressDifference > 0) {
        timelineDevation.isOnTime = false;
        timelineDevation.timeline = {
          weeks: progressDifference,
          days: progressDifference * 5
        };

      } else if (progressDifference === 0) {
        timelineDevation.isOnTime = true;
        timelineDevation.timeline = {
          weeks: 0,
          days: 0
        };
      } else if (progressDifference < 0) {
        timelineDevation.isOnTime = true;
        timelineDevation.timeline = {
          weeks: Math.abs(progressDifference),
          days: Math.abs(progressDifference) * 5
        };
      }

      this.timelineDeviation = timelineDevation;
      
    } else {
      // TODO: Review
      const dayUnit = 1000 * 60 * 60 * 24;

      const finishDate = this.finishDate.weekNo !== -0xFF ? this.finishDate : this.newFinishDate;

      const taskNaturalDuration = (finishDate.date.getTime() - this.startDate.date.getTime()) / dayUnit + 1 + 0.25;

      let taskActualDuration = 0;

      for (let i = 0; i < taskNaturalDuration; i++) {
        const newDay = new Date(this.startDate.date.getTime() + (i * dayUnit));
        // console.log(newDay, newDay.getDay());
        if (newDay.getDay() !== 0 && newDay.getDay() !== 6) {
          taskActualDuration += 1;
        }
      }

      const progressUnit = 1 / taskActualDuration;

      let accumulatedProgress = progressUnit;

      const ranges = new Array(taskActualDuration);
      for (let i = 0; i < ranges.length; i++) {
        ranges[i] = Number.parseFloat(accumulatedProgress.toFixed(3));
        accumulatedProgress += progressUnit;
      }
      const now = new Date();
      const currentDate = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);

      const naturalDayDifference = (currentDate.getTime() - this.startDate.date.getTime()) / dayUnit;

     let actualDayDifference = 0;

      console.log(naturalDayDifference);

     for (let i = 0; i < naturalDayDifference; i++) {
      const newDate = new Date(currentDate.getTime() - (i * dayUnit));
      if (newDate.getDay() !== 0 && newDate.getDay() !== 6) {
        actualDayDifference += 1;
      }
     }

     const currentDateIndex = actualDayDifference;
     let rangeIndex = -1;
     let previousRange = 0;

     for (let i = 0; i < ranges.length; i++) {
      if (i === 0) {
        previousRange = -0.1;
      } else {
        previousRange = ranges[i - 1];
      }

      if (this.progress > previousRange && progressUnit <= ranges[i]) {
        rangeIndex = 1;
      }
     }

     if (currentDateIndex > ranges.length) {
      timelineDevation.isOnTime = false;
      timelineDevation.timeline = {
        days: currentDateIndex - rangeIndex,
        weeks: 1 // TODO: Change
      };
      this.timelineDeviation = timelineDevation;
      return;
     }

     const progressDifference = currentDateIndex - rangeIndex;
     if (progressDifference > 0) {
      timelineDevation.isOnTime = false;
      timelineDevation.timeline = {
        days: progressDifference,
        weeks: 1 // TODO: Change
      };
      this.timelineDeviation = timelineDevation;
     } else if (progressDifference === 0) {
      timelineDevation.isOnTime = true;
      timelineDevation.timeline = {
        days: 0,
        weeks: 0
      };
      this.timelineDeviation = timelineDevation;
     } else if (progressDifference < 0) {
      timelineDevation.isOnTime = true;
      timelineDevation.timeline = {
        days: Math.abs(progressDifference),
        weeks: 1 // TODO: Change
      };

      this.timelineDeviation = timelineDevation;
     }


     return;

    }
  }

  public checkRemaining(): boolean {

    if (this.targetCount !== -0xFF && this.completedCount !== -0xFF) {
      const completed = this.targetCount - this.completedCount;

      if (this.completedCount === completed) {
        return true;
      } else {
        this.completedCount = completed;
        return false;
      }
    }

    return true;
  }
}

export class Workplan {
  public projectId: string;
  public projectName: string;
  public projectObjective: string;
  public projectStartDate: WPDate;
  public totalProgress: number;
  public plannedProgress: number;
  public projectRemarks: string;
  public status: Status;
  public timeStatus: TimeStatus;
  public durationAndDateFormat: number;

  public activities: Milestone[];

  constructor() {
    this.activities = [];
  }
}

// export class Workplan {
//   public projectId: string;
//   public projectName: string;
//   public projectObjective: string;
//   public projectOwner: string;
//   public projectStartDate: BlockerDate;
//   public projectRemarks: string;
//   public projectProgress: number;
//   public projectPlannedProgress: number;
//   public projectStatus: Status;
//   public projectTimeStatus: TimeStatus;
//   public type: WorkplanType;

//   public milestone: Task[];

//   constructor() {

//   }
// }

// export class Milestone {
//   public flag: Flag;
//   public numerator: string;
//   public name: string;
//   public responsible: string;
//   public status: Status;
//   public progress: number;
  

//   constructor() {

//   }
// }

// export class Task {

// }
