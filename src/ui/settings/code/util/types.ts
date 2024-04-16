export type CustomKeyboardEvent = {
  key: string;
  modifiers: {
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean
  }
};