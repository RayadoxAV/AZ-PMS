/* 
  Raymundo Paz
  March 2024
*/

import { GanttGrid, GanttCanvasObject, GanttRange, GanttRect } from './data/ganttCanvas';
import { GanttMilestone, GanttTask } from './data/ganttData';
import { drawArrow } from './util/canvasUtilities';

export function initGanttUI(): void {
  
  const milestone1 = new GanttMilestone('Milestone 1', { weeks: 4, days: 20 }, '', '', 0);
  const task11 = new GanttTask('1. Task', { weeks: 2, days: 10 }, '', '', '', '', 1, 1);
  
  const task12 = new GanttTask('2. Task', { weeks: 1, days: 5 }, '', '', '', '', 0.75, 2);
  const task121= new GanttTask('2.1 Task', { weeks: 1, days: 5 }, '', '', '', '', 1, 3);

  task12.subtasks = [task121];
  const task13 = new GanttTask('3. Task', { weeks: 4, days: 20 }, '', '', '', '', 0.5, 4);
 

  milestone1.tasks = [task11, task12, task13];

  const milestone2 = new GanttMilestone('Milestone 2', { weeks: 6, days: 30 }, '', '', -1);

  milestone2.tasks = [task11, task12, task13];

  const testStruct = {
    milestones: [
      milestone1,
      milestone1
    ]
  };

  initSideview(testStruct);
  const result = initGanttView(testStruct);

}

/* TODO: Type for input */
function initSideview(projectStructure: any): void {

  const sideview = document.getElementById('gantt-sideview');
  let structureHTML = '<div style="height: 2rem;">a</div>';

  for (let i = 0; i < projectStructure.milestones.length; i++) {
    const milestone = projectStructure.milestones[i] as GanttMilestone;

    structureHTML += 
    `
      <div class="parent">
        <div class="name-container" tabindex="0">
          <i class="icon" data-icon="arrow-expand"></i>
          <span class="name">${milestone.name}</span>
        </div>
        ${milestone.tasks.length > 0 ? 
          generateTasksHTML(milestone.tasks, 1) : ''
        }
      </div>
    `;
  }

  sideview.innerHTML = structureHTML;
}

function generateTasksHTML(tasks: GanttTask[], level: number): string {

  let tasksHTML = `<div class="children-wrapper"><div class="children" style="--level: ${level * 0.5}rem">`;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.subtasks.length > 0) {
      tasksHTML += 
      `<div class="parent">
        <div class="name-container" tabindex="0">
        <i class="icon" data-icon="arrow-expand"></i>
        <span class="name">${task.name}</span></div>
        ${generateTasksHTML(task.subtasks, level + 1)}
      </div>`;
    } else {
      tasksHTML += `<div class="name-container" tabindex="0"><span class="name">${task.name}</span></div>`;
    }
  }

  tasksHTML += '</div></div>';
  
  return tasksHTML;
}

function initGanttView(projectStructure: any) {
  const canvas = document.getElementById('timeline-canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  context.translate(0.5, 0.5);

  const grid = new GanttGrid(100, 32, '#EFEFEF');
  grid.draw(context);

  const ganttObjects: GanttCanvasObject[] = [];

  for (let i = 0; i < projectStructure.milestones.length; i++) {
    const milestone = projectStructure.milestones[i] as GanttMilestone;

    const ganttRange = new GanttRange(8, 32 * milestone.index, milestone.duration.weeks * 100, 32, '#E2E2E3', '#E2E2E3');
    ganttObjects.push(ganttRange);
    
    if (milestone.tasks.length > 0) {
      const objects = generateTasksGantt(milestone.tasks);
      ganttObjects.push(...objects);
    }

    
  }

  for (let i = 0; i < ganttObjects.length; i++) {
    ganttObjects[i].draw(context);
  }
}

function generateTasksGantt(tasks: GanttTask[]): GanttCanvasObject[] {

  const ganttObjects: GanttCanvasObject[] = [];
  
  for (let i = 0; i < tasks.length; i ++) {
    const task = tasks[i];

    const ganttRect = new GanttRect(8, (32 * task.index) + 4, task.duration.weeks * 100, 24, '#f56565', '#f5d0d0');
    ganttObjects.push(ganttRect);

    if (task.subtasks.length > 0) {
      const objects = generateTasksGantt(task.subtasks);
      ganttObjects.push(...objects);
    }
  }

  return ganttObjects;
}

function reactToChanges() {

}