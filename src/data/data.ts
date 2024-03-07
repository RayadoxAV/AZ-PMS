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
  public value: any;
  public background: string;

  constructor() {
    this.rowNumber = -1;
    this.colName = '';
    this.address = '';
    this.value = {

    };
    this.background = '';
  }
}