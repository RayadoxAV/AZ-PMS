/* 
  Raymundo Paz
  March 2024
*/

export interface InternalState {
  contextMenuVisible: boolean;
  contextMenuCoords: ScreenPos;
  optionsMenuVisible: boolean;
};

export interface ScreenPos {
  x: number;
  y: number;
};

export interface UIBlockerDate {
  date: Date,
  week: number,
  fiscalYear: number,
  dateUTC?: number
};

