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
