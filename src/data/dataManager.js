/* 
  Author: Raymundo Paz
  Date: 12/29/2023
*/

const { BrowserWindow } = require("electron");
const Logger = require("../util/Logger");
const BridgeProvider = require("./bridgeProvider");
const DataExtractor = require("./dataExtractor");
const { Workplan } = require("./types");
const WorkbookProvider = require("./workbookProvider");
const { InferenceEngine } = require("./inferenceEngine");
const { PersistenceManager } = require("./persistenceManager");

class DataManager {
  async manageDataEvents(_, args) {
    if (!args) {
      Logger.Log(`Invalid argument structure`, 3);
      return;
    }

    switch (args.name) {
      case 'load-project': {
  
        const { path, link, projectId } = global.shared.args;
        
        if (!path || !projectId) {
          Logger.Log('Not enough arguments specified', 3);
          return;
        }

        if (path && link) {
          Logger.Log('Path and link specified. Can not decide. Aborting...', 3);
          return;
        }

        await PersistenceManager.createDBIfNotExists();
        await this.loadProject({ path, projectId });
        break;
      }

      case 'workplan-open': {
        console.log(process.argv);
        // TODO: Open the real workplan. Maybe need to pass the link in the arguments.
        // Might be easier once I extract information from the internet. Event
        break;
      }

      default: {
        Logger.Log(`Unknown data event ${args.name}`, 3);
      }
    }
  }

  async loadProject({ path, projectId }) {

    const dataExtractor = new DataExtractor();

    const workbookProvider = new WorkbookProvider();

    const workbook = await workbookProvider.provideWorkbook(path);
    workbook.name = path.split('/').pop();

    if (workbook.error) {
      // TODO: Emit error event to frontend
      return;
    }

    const workplanSheet = dataExtractor.evaluateSheets(projectId, workbook);

    if (workplanSheet.error) {
      // TODO: Emit error event to frontend
      return;
    }

    const [workplanVersion, fields] = dataExtractor.getWorkplanVersion(workplanSheet);

    if (!workplanVersion) {
      // TODO: Emit error event to frontend
      Logger.Log('No workplan version found', 3);
      return;
    }

    const workplanType = dataExtractor.getWorkplanType(workplanVersion, fields);

    const bridgeProvider = new BridgeProvider();

    const bridge = bridgeProvider.provideBridge(fields, workplanSheet);

    if (!bridge) {
      // TODO: Emit error event to frontend. Therically there is no reason for this to fail.
      Logger.Log('No bridge object found', 3);
      return;
    }

    if (bridge.size === 0) {
      // TODO: Emit error event to frontend.
      Logger.Log('No entries found for Bridge Object', 3);
      return;
    }

    const workplan = new Workplan();
    workplan.pathOrURL = path;
    workplan.version = workplanVersion;
    workplan.type = workplanType;

    const projectData = dataExtractor.getProjectData(bridge, workplanSheet, workplan.version, workplan.type);

    Object.assign(workplan, projectData);

    const milestoneData = dataExtractor.getMilestoneData(bridge, workplanSheet, workplan.type, workplan.version, workplan.projectId);

    workplan.milestones = milestoneData;

    const inferenceEngine = new InferenceEngine();

    const inferences = await inferenceEngine.infer(workplan);

    // TODO: Run inference and calculations
    Object.assign(workplan, inferences);

    const workStatus = InferenceEngine.inferProjectWorkStatus(workplan);

    workplan.projectStatus = workStatus;

    workplan.report = inferenceEngine.generateReport(workplan);

    BrowserWindow.getAllWindows()[0].webContents.send('data-events', { name: 'project-loaded', data: JSON.stringify(workplan) });

    return workplan;
  }
}


const dataManager = new DataManager();
dataManager.manageDataEvents = dataManager.manageDataEvents.bind(dataManager);

module.exports = dataManager;
