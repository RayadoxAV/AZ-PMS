/* 
  Raymundo Paz
  March 2024
*/

export enum LogType {
  INFO = 0,
  SUCCESS = 1,
  WARNING = 2,
  ERROR = 3,
  TEST = 4,
  PERFORMANCE = 5
}

export class Logger {

  public static logColors = [
    {
      foreground: '',
      background: '',
      name: 'INFO'
    },
    {
      foreground: '\x1b[37m',
      background: '\x1b[42m',
      name: 'SUCCESS'
    },
    {
      foreground: '\x1b[37m',
      background: '\x1b[43m',
      name: 'WARNING'
    },
    {
      foreground: '\x1b[37m',
      background: '\x1b[41m',
      name: 'ERROR'
    },
    {
      foreground: '\x1b[37m',
      background: '\x1b[100m',
      name: 'TEST'
    },
    {
      foreground: '\x1b[37m',
      background: '\x1b[44m',
      name: 'PERFORMANCE'
    }
  ];

  public static log(message: string, type: LogType): void {
    if (process.env.LOGS === 'on') {
      if (process.env.CURR_ENV === 'dev') {
        const reset = '\x1b[0m';
        const logType = Logger.logColors[type];
        console.log(`${logType.background}${logType.foreground}%s${reset}`, `${logType.name}:`, message);
      } else {
        // TODO: If logging is enabled and in we are in 'prod' then log to a file in disk.
      }
    }
  }
}
