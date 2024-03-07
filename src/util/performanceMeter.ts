/* 
  Raymundo Paz
  March 2024
*/

import { LogType, Logger } from './logger';

export class PerformanceMeter {
  private startTime: number;
  private finishTime: number;
  private result: number;

  constructor() {
    this.startTime = 0;
    this.finishTime = 0;
    this.result = 0;
  }

  start(): number {
    if (process.env.PERFORMANCE_METRICS === 'on') {
      this.startTime = performance.now();
    }

    return this.startTime;
  }

  end(): number {
    if (process.env.PERFORMANCE_METRICS === 'on') {
      this.finishTime = performance.now();

      this.result = this.finishTime - this.startTime;

      if (this.result === 0 || this.startTime === 0) {
        Logger.log('Performance result was 0ms. Did you forget to call the start method?', LogType.WARNING);
      }
      return this.result;
    }
    return 0;
  }

  log(metricTitle: string = ''): void {
    if (process.env.PERFORMANCE_METRICS === 'on') {
      Logger.log(`[${metricTitle}] took ${this.result}ms`, LogType.PERFORMANCE);
    }
  }
}
