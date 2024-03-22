import { GanttRange, GanttRect } from "./ganttCanvas";

export interface GanttDuration {
  days: number;
  weeks: number;
  hours?: number;
}

export class GanttMilestone {
  public name: string;
  public duration: GanttDuration;
  public tasks: GanttTask[];
  public startDate: {};
  public finishDate: {};
  public index: number;
  public ganttRange: GanttRange;

  constructor() {

  }

  public draw(context: CanvasRenderingContext2D): void {
    this.ganttRange.draw(context);
  }
}

export class GanttTask {
  public name: string;
  public duration: GanttDuration;
  public subtasks: GanttTask[];
  public startDate: {};
  public finishDate: {};
  public newFinishDate: {};
  public actualDate: {};
  public progress: {};
  public index: number;
  public ganttRect: GanttRect;

  constructor() {

  }

  public draw(context: CanvasRenderingContext2D): void {
    this.ganttRect.draw(context);
  }
}
