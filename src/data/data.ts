import { BlockerDate, Flag, Status, TimeStatus, WorkplanType, CellType, Label, Duration, WPDate, CellError } from '../util/misc';

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

    let [startCellColumn, startRow] = startCell.match(/[a-z]+|[^a-z]+/gi);
    let [endCellColumn, endRow] = endCell.match(/[a-z]+|[^a-z]+/gi);

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

  constructor() {
    this.subtasks = [];
  }

  toString(): string {
    return `Task [${this.number} ${this.name} -> ${this.status} - ${this.progress}]`;
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
