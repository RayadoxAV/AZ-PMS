/* 
  Raymundo Paz
  March 2024
*/

import { CellErrorValue, CellFormulaValue, CellHyperlinkValue, CellRichTextValue, CellSharedFormulaValue, ErrorValue } from 'exceljs';

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
  // return (value as CellSharedFormulaValue).sharedFormula !== undefined;
  return false;
}

export function isErrorValue(value: any): value is ErrorValue {
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

