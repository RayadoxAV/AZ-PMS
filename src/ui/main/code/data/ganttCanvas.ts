
export class GanttRect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public borderColor: string;
  public bgColor: string;

  constructor(x: number, y: number, width: number, height: number, borderColor: string, bgColor: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.borderColor = borderColor;
    this.bgColor = bgColor;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.bgColor;
    context.strokeStyle = this.borderColor;
    context.lineWidth = 1;

    context.beginPath();
    context.roundRect(this.x, this.y, this.width, this.height, 4);
    context.fill();
    context.stroke();

  }

  hide(): void {

  }
}

export class GanttRange {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public borderColor: string;
  public bgColor: string;

  constructor(x: number, y: number, width: number, height: number, borderColor: string, bgColor: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.borderColor = borderColor;
    this.bgColor = bgColor;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.borderColor;
    context.fillStyle = this.borderColor;

    context.beginPath();
    context.moveTo(this.x, this.y + 2);
    context.lineTo(this.x, this.y + this.height);
    context.stroke();
    
    context.fillStyle = this.bgColor;    
    context.beginPath();
    context.roundRect(this.x, this.y, this.width, 16, [ 4, 4, 0, 0 ])

    context.fill();
    
    context.beginPath();
    context.moveTo(this.x + this.width, this.y + 2);
    context.lineTo(this.x + this.width, this.y + this.height);
    context.stroke();

  }
}

export class GanttGrid {
  public cellWidth: number;
  public cellHeight: number;
  public borderColor: string;

  constructor(cellWidth: number, cellHeight: number, borderColor: string) {
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.borderColor = borderColor;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.borderColor;

    const canvasWidth = context.canvas.width;
    const canvasHeight = context.canvas.height;

    const verticalLineCount = canvasWidth / this.cellWidth;
    const horizontalLineCount = canvasHeight / this.cellHeight;

    context.beginPath();
    for (let i = 0; i < verticalLineCount; i++) {
      context.moveTo(8 + (i * this.cellWidth) + 1, 0);
      context.lineTo(8 + (i * this.cellWidth) + 1, canvasHeight);
    }
    context.stroke();

    context.beginPath();
    for (let i = 0; i < horizontalLineCount; i++) {
      context.moveTo(8, (i * this.cellHeight));
      context.lineTo(canvasWidth, (i * this.cellHeight));
    }
    context.stroke();
  }
}