/* 
  Raymundo Paz
  March 2024
*/

import { CellErrorValue, CellFormulaValue, CellHyperlinkValue, CellRichTextValue, CellSharedFormulaValue, ErrorValue } from 'exceljs';
import { WorkplanField } from './misc';
import { Workplan } from '../data/data';

export function XOR(a: any, b: any): boolean {
  return (a || b) && !(a && b);
}

export function isDate(value: any): value is Date {
  return (value as Date).getDate !== undefined;
}

export function isCellErrorValue(value: any): value is CellErrorValue {
  return (value as CellErrorValue).error !== undefined;
}

export function isCellRichTextValue(value: any): value is CellRichTextValue {
  return (value as CellRichTextValue).richText !== undefined;
}

export function isCellHyperlinkValue(value: any): value is CellHyperlinkValue {
  return (value as CellHyperlinkValue).hyperlink !== undefined;
}

export function isCellFormulaValue(value: any): value is CellFormulaValue {
  // console.log(value as CellFormulaValue);
  // console.log('aa', value);
  // console.log((value as CellFormulaValue).formula !== undefined, value);
  return (value as CellFormulaValue).formula !== undefined;
}

export function isCellSharedFormulaValue(value: any): value is CellSharedFormulaValue {
  return (value as CellSharedFormulaValue).sharedFormula !== undefined;
}

export function isErrorValue(value: unknown): value is ErrorValue {
  const mValue = value as ErrorValue;

  let result = false;

  switch (mValue) {
    case ErrorValue.NotApplicable:
      result = true;
      break;

    case ErrorValue.Ref:
      result = true;
      break;

    case ErrorValue.Name:
      result = true;
      break;

    case ErrorValue.DivZero:
      result = true;
      break;

    case ErrorValue.Null:
      result = true;
      break;

    case ErrorValue.Value:
      result = true;
      break;

    case ErrorValue.Num:
      result = true;
      break;

    default:
      result = false;
      break;
  }
  return result;
}

export function isWorkplan(value: any): value is Workplan {
  return 'projectId' in value &&
    'projectName' in value &&
    'projectObjective' in value &&
    'projectStartDate' in value &&
    'totalProgress' in value &&
    'plannedProgress' in value &&
    'projectRemarks' in value &&
    'status' in value &&
    'timeStatus' in value &&
    'activities' in value;
}

export function nPlusColumn(column: string, shift: number): string {
  column.toUpperCase();
  // console.log(column.charCodeAt(0));
  if (column.length === 1) {
    const char = column.charCodeAt(0) + shift;

    if (char > 90) {
      return 'A' + String.fromCharCode(char - 90 + 64);
    } else {
      return String.fromCharCode(char);
    }

  } else {
    // TODO: Implement
    console.log('IMPLEMENT THIS');
    return '';
  }
}

export function getFiscalYear(date: Date): number {
  const august = new Date(`${date.getFullYear()}/08/31`);
  let lastSaturday: Date = undefined;

  for (let i = 0; i < 8; i++) {
    const testDate = new Date(august.getTime() - (i * 86400000));

    if (testDate.getDay() === 6) {
      lastSaturday = testDate;
    }
  }

  if (date.getTime() <= lastSaturday.getTime()) {
    return date.getFullYear();
  } else {
    return date.getFullYear() + 1;
  }
}

/* 

TODO: Translate
La idea es tener todos los campos que un Workplan puede tener contemplados aqui.
Si se agrega uno de repente, se agrega aqui y todos los workplans que lo tengan van a tenerlo dentro del programa.

  name: Nombre de como se va a manejar la propiedad dentro del codigo.
  displayName: Como se llama dentro de un Workplan cualquiera.
  useCases: Partes de la aplicacion donde se usa el campo.
  aliases: Todos los otros nombres con los que se conoce al campo
  expectedType: El tipo esperado del campo en el Workplan.
*/
//#region Workplan Fields
export const workplanFields: WorkplanField[] = [
  {
    name: 'projectId',
    displayName: 'Project Id',
    mandatory: true,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'string',
    findValue: 'immediate-below'
  },
  {
    name: 'projectName',
    displayName: 'Project Name',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'string',
    findValue: 'immediate-below'
  },
  {
    name: 'projectObjective',
    displayName: 'Project Objective',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'string',
    findValue: 'immediate-below'
  },
  {
    name: 'projectStartDate',
    displayName: 'Project Start Date',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: '{BlockerDate}',
    findValue: 'immediate-below'
  },
  {
    name: 'totalProgress',
    displayName: 'Total Progress',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'number',
    findValue: 'immediate-right'
  },
  {
    name: 'plannedProgress',
    displayName: 'Planned Progress',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'number',
    findValue: 'immediate-right'
  },
  {
    name: 'projectRemarks',
    displayName: 'Remarks',
    mandatory: true,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'string',
    findValue: 'immediate-below'
  },
  {
    name: 'flag',
    displayName: 'Flags',
    mandatory: true,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 't:Flag',
    findValue: 'column-down'
  },
  {
    name: 'label',
    displayName: 'Label',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 't:Label',
    findValue: 'column-down'
  },
  {
    name: 'number',
    displayName: '#',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'name',
    displayName: 'Task',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'subtask',
    displayName: 'Sub-task',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'jiraId',
    displayName: 'Jira Id',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'gantt'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'responsible',
    displayName: 'Responsible',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'gantt'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'status',
    displayName: 'Status',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 't:Status',
    findValue: 'column-down'
  },
  {
    name: 'progress',
    displayName: 'Progress',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'storyPoints',
    displayName: 'Story Points',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'gantt'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'duration',
    displayName: 'Task Duration',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: ['Task Duration (Weeks)', 'Task Duration (Days)', 'Estimated Time', 'Estimated Time (Days)'],
    expectedType: 't:Duration',
    findValue: 'column-down'
  },
  {
    name: 'startDate',
    displayName: 'Start Date',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: ['Start date week', 'Start Date'],
    expectedType: 't:WPDate',
    findValue: 'column-down'
  },
  {
    name: 'finishDate',
    displayName: 'Finish Date',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: ['Finish date Week', 'Finish Date'],
    expectedType: 't:WPDate',
    findValue: 'column-down'
  },
  {
    name: 'newFinishDate',
    displayName: 'New Finish Date',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 't:WPDate',
    findValue: 'column-down'
  },
  {
    name: 'actualDate',
    displayName: 'Actual Date',
    mandatory: true,
    useCases: ['blocker', 'blocker-report', 'gantt', 'charts', 'historic'],
    aliases: [],
    expectedType: 't:WPDate',
    findValue: 'column-down'
  },
  {
    name: 'predecessor',
    displayName: 'Task Predecessor',
    mandatory: false,
    useCases: ['gantt'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'completedCount',
    displayName: 'Completed (if applicable)',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'charts'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'targetCount',
    displayName: 'Target (if applicable)',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'charts'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'remainingCount',
    displayName: 'Remaining (if applicable)',
    mandatory: false,
    useCases: ['blocker', 'blocker-report', 'charts'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'receivedLastWeekCount',
    displayName: 'Received Last Week',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'workedLastWeekCount',
    displayName: 'Worked Last Week',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'number',
    findValue: 'column-down'
  },
  {
    name: 'remarks',
    displayName: 'Remarks',
    mandatory: true,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'comments',
    displayName: 'Comments',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'string',
    findValue: 'column-down'
  },
  {
    name: 'lastUpdated',
    displayName: 'Last updated',
    mandatory: false,
    useCases: ['blocker', 'blocker-report'],
    aliases: [],
    expectedType: 'date',
    findValue: 'column-down'
  }
];

//#region: Custom Events
export type CustomKeyboardEvent = {
  key: string;
  modifiers: {
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean
  }
};
