import { UIBlockerDate } from '../types';
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
  public startDate: UIBlockerDate;
  public finishDate: UIBlockerDate;
  public index: number;
  public ganttRange: GanttRange;

  constructor(name: string, duration: GanttDuration, startDate: UIBlockerDate, finishDate: UIBlockerDate, index: number) {
    this.name = name;
    this.duration = duration;
    this.startDate = startDate;
    this.finishDate = finishDate;
    this.index = index;
    this.tasks = [];
  }

  public draw(context: CanvasRenderingContext2D): void {
    this.ganttRange.draw(context);
  }
}

export class GanttTask {
  public name: string;
  public duration: GanttDuration;
  public subtasks: GanttTask[];
  public startDate: UIBlockerDate;
  public finishDate: UIBlockerDate;
  public newFinishDate: UIBlockerDate;
  public actualDate: UIBlockerDate;
  public progress: number;
  public index: number;
  public ganttRect: GanttRect;

  constructor(name: string, duration: GanttDuration, startDate: UIBlockerDate, finishDate: UIBlockerDate, newFinishDate: UIBlockerDate, actualDate: UIBlockerDate, progress: number, index: number) {
    this.name = name;
    this.duration = duration;
    this.startDate = startDate;
    this.finishDate = finishDate;
    this.newFinishDate = newFinishDate;
    this.actualDate = actualDate;
    this.progress = progress;
    this.index = index;
    this.subtasks = [];
  }

  public draw(context: CanvasRenderingContext2D): void {
    this.ganttRect.draw(context);
  }
}