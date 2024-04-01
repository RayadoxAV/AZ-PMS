/* 
  Raymundo Paz
  March 2024
*/

import { ArgumentsObject } from './argsManager';

export interface GlobalSharedObject {
  args: ArgumentsObject;
}

export interface CellError {
  errorType: string;
}

export interface BlockerDate {
  week: number;
  date: Date;
}

export enum Status {
  InWork = 'In Work',
  Completed = 'Completed',
  OnHold = 'On Hold',
  Cancelled = 'Cancelled',
  NotStarted = 'Not Started' 
}

export enum TimeStatus {
  OnTime = 'On Time',
  Behind = 'Behind',
  OutOfTrack = 'Out of Track'
}

export enum Flag {
  Completed = 'Completed',
  Risk = 'Risk',
  Report = 'Report',
  Recurrent = 'Recurrent',
  RecurrentReport = 'Recurrent / Report'
}


export type WorkplanType = 'Daily' | 'Weekly' | 'Scrum';

export type WorkplanField = {
  name: string;
  displayName: string;
  mandatory: boolean;
  useCases: string[];
  aliases: string[];
  expectedType: string;
  findValue: string;
}
