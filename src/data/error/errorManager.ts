/* 
  Raymundo Paz
  March 2024
*/

import { BrowserWindow } from 'electron';
import { LogType, Logger } from '../../util/logger';

export class CustomError extends Error {
  public name: string;
  public body: string;

  private fatal: boolean;
  private propagate: boolean;

  public userMessage: string;

  constructor(message: string, name: string, fatal: boolean, propagate: boolean, userMessage: string) {
    super(message);
    this.name = name;
    this.userMessage = userMessage;

    this.fatal = fatal;
    this.propagate = propagate;

    if (!this.isFatal) {
      this.stack = '';
    }

    this.body = `${this.isFatal ? 'FATAL ERROR ->' : ''} ${!this.isFatal ? `${this.name} - ${this.message}` : this.stack}`;
  }

  public get isFatal(): boolean {
    return this.fatal;
  }

  public get shouldPropagate(): boolean {
    return this.propagate;
  }
}

export class ErrorManager {
  static throwError(error: CustomError): CustomError | undefined {
    Logger.log(error.body, LogType.ERROR);
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      window.webContents.send('error', { message: error.userMessage });
    } else {
      console.log(error);
    }

    if (error.shouldPropagate) {
      return error;
    }

    if (error.isFatal) {
      // TODO: Prompt the user about the fatal error and trigger a process exit from response.
    }
  }
}