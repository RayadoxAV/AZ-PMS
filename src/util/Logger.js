/**
@class Implementation of a basic logging class
*/
class Logger {

  /**
   * Log a message to the console. (Only if logging is activatedf)
   * @param {string} message - A message to log to the console
   * @param {number} type - A severity level for the message
   */
  static Log(message, type) {
    if (process.env.LOGS === 'on') {
      console.log(`${message}`);
    }
  }

}

module.exports = Logger;