/* 
  Raymundo Paz
  March 2024
*/

import { GanttGrid, GanttRange, GanttRect } from './data/ganttCanvas';
import { drawArrow } from './util/canvasUtilities';

export function initGanttUI(): void {
  // TODO: Tidy Up
  const canvas = document.getElementById('timeline-canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  context.translate(0.5, 0.5);

  const grid = new GanttGrid(100, 32, '#EFEFEF');
  grid.draw(context);

  const range = new GanttRange(8, 4, 600, 32 * 7, '#E2E2E3', '#E0E0E0');
  range.draw(context);

  const rect2 = new GanttRect(8, 36, 150, 24, '#ec6b68', '#ff9590');
  rect2.draw(context);

  const rect3 = new GanttRect(158, 68, 150, 24, '#68ccec', '#91dfff');
  rect3.draw(context);

  const rect4 = new GanttRect(308, 100, 300, 24, '#ec6b68', '#ff9590');
  rect4.draw(context);

  context.strokeStyle = '#00FF00';
  context.beginPath();
  context.stroke();


  canvas.onmousemove = (event) => {
    
  };

}
