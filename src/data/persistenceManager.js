/* 
  Author: Raymundo Paz
  Date: 01/15/2024
  Persistence manager for "DB"
*/
const fs = require('fs');
const { promisify } = require('util');
const Util = require('../util/util');
const Logger = require('../util/Logger');


const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

/* NOTE:
  For the sake of simplicity, when an Activity is registered in this "DB" it is expected of the user to prepend the name of the milestone for the activity as follows:
  [milestone_name] => ([activity_number]. [activity_name])
  This is to ensure a somewhat "unique" identifier for each activity without generating a hash or a UUID from it.
  Which would only cause issues given the fact that activity names and milestone name can and do repeat.
*/

/* DB = Some random file on xterra */
class PersistenceManager {

  static dbPath = 'C:/Users/rpaz/Documents/testing/az_pms/db/reporting.json';
  // static dbPath = '\\\\xterra\\analysis\\Merch FY2024 Workplans\\data\\db\\reporting.json';
  // static dbFolder = '\\\\xterra\\analysis\\Merch FY2024 Workplans\\data\\db';
  static dbFolder = 'C:/Users/rpaz/Documents/testing/az_pms/db';

  static dbTemplate =
    {
      meta: {
        version: 1
      },
      projects: [

      ]
    };


  static async createDBIfNotExists() {
    let created = false;

    try {
      if (!fs.existsSync(PersistenceManager.dbFolder)) {
        await mkdir(PersistenceManager.dbFolder);
        created = true;
      }

      if (created) {
        writeFile(PersistenceManager.dbPath, JSON.stringify(PersistenceManager.dbTemplate), { encoding: 'utf-8' });
      } else {
        if (!fs.existsSync(PersistenceManager.dbPath)) {
          writeFile(PersistenceManager.dbPath, JSON.stringify(PersistenceManager.dbTemplate), { encoding: 'utf-8' });
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }

    return created;
  }

  static async searchInDB(projectId, entryName) {
    let result = undefined;

    try {

      const db = await PersistenceManager.readDBFile();

      for (let i = 0; i < db.projects.length; i++) {
        const project = db.projects[i];

        if (projectId === project.id) {

          for (let j = 0; j < project.entries.length; j++) {
            const entry = project.entries[j];

            if (entry.name === entryName) {
              result = {
                name: entry.name,
                type: entry.type,
                reportedDate: {
                  week: entry.reportedDate.week,
                  date: entry.reportedDate.date
                }
              };
              // result = {
              //   name: activity.name,
              //   progress: activity.progress,
              //   lastReportDate: activity.lastReportDate
              // };
              break;
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  static async deleteFromDB(projectId, activityName) {
    try {
      const db = await PersistenceManager.readDBFile();
      let deleteIndex = -1;

      for (let i = 0; i < db.projects.length; i++) {
        const project = db.projects[i];

        if (projectId === project.id) {

          for (let j = 0; j < project.entries.length; j++) {
            const entry = project.entries[j];
            if (entry.name === activityName) {
              deleteIndex = j;

              project.entries.splice(j, 1);

            }
          }
        }
      }

      if (deleteIndex === -1) {
        return false;
      }

      await PersistenceManager.writeDBFile(db);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async updateFromDB(projectId, entryName, newEntry) {
    try {
      const db = await PersistenceManager.readDBFile();
      let updateIndex = -1;

      for (let i = 0; i < db.projects.length; i++) {
        const project = db.projects[i];

        if (project.id === projectId) {
          for (let j = 0; j < project.entries.length; j++) {
            const entry = project.entries[j];

            if (entry.name === entryName) {
              updateIndex = j;

              // activity.name = newActivity.name;
              // activity.progress = newActivity.progress;
              // activity.lastReportDate.week = newActivity.lastReportDate.week;
              // activity.lastReportDate.date = newActivity.lastReportDate.date;

              break;
            }
          }
        }
      }

      if (updateIndex === -1) {
        return false;
      }

      await PersistenceManager.writeDBFile(db);

      return true;

    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async addToDB(projectId, item, entryType) {
    try {
      const db = await PersistenceManager.readDBFile();

      let added = false;

      const date = new Date(new Date().getTime() - 21600000);
      
      const newEntry = {
        type: entryType,
        name: item.name,
        completionDate: {
          week: item.completionDate.week,
          date: item.completionDate.date.toISOString().split('T')[0]
        },
        reportedDate: {
          week: Util.dateToWeek(new Date()),
          date: date.toISOString().split('T')[0]
        }
      };

      db.projects.forEach((project) => {
        if (project.id === projectId) {
          project.entries.push(newEntry);
          added = true;
        }
      });

      if (!added) {
        db.projects.push(
          {
            id: projectId,
            entries: [newEntry]
          }
        );
        added = true;
      }
      await PersistenceManager.writeDBFile(db);
      return [newEntry, added];

    } catch (error) {
      console.log(error);
      return [undefined, false];
    }
/*     try {
      const db = await PersistenceManager.readDBFile();
      let added = false;

      const date = new Date(new Date().getTime() - 21600000);
      const newActivity = {
        name: activityName,
        progress: progress,
        reportedDate: {
          week: Util.dateToWeek(new Date()),
          date: date.toISOString().split('T')[0]
        }
      };

      for (let i = 0; i < db.projects.length; i++) {
        const project = db.projects[i];

        if (projectId === project.id) {
          project.activities.push(newActivity);
          added = true;
        }
      }

      if (!added) {
        db.projects.push({
          id: projectId,
          activities: [newActivity]
        });
      }

      await PersistenceManager.writeDBFile(db);
      return [newActivity, added];
    } catch (error) {
      console.log(error);
      return [undefined, false];
    } */
  }

  static async readDBFile() {
    try {
      const dbString = await readFile(PersistenceManager.dbPath, { encoding: 'utf-8' });
      const db = JSON.parse(dbString);
      return db;
    } catch (error) {
      // Logger.Log('Fatal error. DB file is empty', 3);
      console.log(error);
      return undefined;
    }
  }

  static async writeDBFile(dbObject) {
    try {

      if (!fs.existsSync(PersistenceManager.dbFolder)) {
        await mkdir(PersistenceManager.dbFolder);
      }
      await writeFile(PersistenceManager.dbPath, JSON.stringify(dbObject), { encoding: 'utf-8' });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = {
  PersistenceManager
};
