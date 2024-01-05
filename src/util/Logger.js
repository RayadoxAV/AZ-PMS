/**
@class Implementation of a basic logging class
*/
class Logger {

  /**
   * Log a message to the console. (Only if logging is activatedf)
   * @param {string} message - A message to log to the console
   * @param {number} type (0-3) - A severity level for the message
   */
  static Log(message, type) {
    if (process.env.LOGS === 'on') {

      const reset = '\x1b[0m';

      switch (type) {
        case 0:
          console.log( `INFO: ${message}`);
          break;
        case 1: {
          const color = '\x1b[32m';
          console.log(`${color}%s${reset}`, `SUCCESS: ${message}`);
          break;
        }
        case 2: {
          const color = '\x1b[33m';
          console.log(`${color}%s${reset}`, `WARNING: ${message}`);
          break;
        }
        case 3: {
          const color = '\x1b[31m';
          console.log(`${color}%s${reset}`, `ERROR: ${message}`);
          break;
        }
      }
    }
  }

}

module.exports = Logger;