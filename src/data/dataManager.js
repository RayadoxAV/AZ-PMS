const { BrowserWindow } = require("electron");
const Logger = require("../util/Logger");
const BridgeProvider = require("./bridgeProvider");
const DataExtractor = require("./dataExtractor");
const { Workplan } = require("./types");
const WorkbookProvider = require("./workbookProvider");
const { InferenceEngine } = require("./inferenceEngine");

class DataManager {
  async manageDataEvents(_, args) {
    console.log(args);
    if (!args) {
      Logger.Log(`Invalid argument structure`, 3);
      return;
    }

    switch (args.name) {
      case 'load-project': {

        let path = '';
        let projectId = '';

        if (process.argv[1] === '.') {
          path = process.argv[2];
          projectId = process.argv[3];
        } else {
          path = process.argv[1];
          projectId = process.argv[2];
        }

        if (!path || !projectId) {
          Logger.Log('Not enough arguments specified', 3);
          return;
        }

        await this.loadProject({ path, projectId });
        break;
      }

      default: {
        Logger.Log(`Unknown data event ${args.name}`, 3);
      }
    }
  }

  async loadProject({ path, projectId }) {
    console.log(path, projectId);

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
      return;
    }

    const workplanType = dataExtractor.getWorkplanType(workplanVersion, fields);

    const bridgeProvider = new BridgeProvider();

    const bridge = bridgeProvider.provideBridge(fields, workplanSheet);

    if (!bridge) {
      // TODO: Emit error event to frontend. Therically there is no reason for this to fail.
      return;
    }

    const workplan = new Workplan();
    workplan.pathOrURL = path;
    workplan.version = workplanVersion;
    workplan.type = workplanType;

    const projectData = dataExtractor.getProjectData(bridge, workplanSheet, workplan.version, workplan.type);

    Object.assign(workplan, projectData);

    const milestoneData = dataExtractor.getMilestoneData(bridge, workplanSheet, workplan.type, workplan.version);

    workplan.milestones = milestoneData;

    const inferenceEngine = new InferenceEngine();

    const inferences = inferenceEngine.infer(workplan);

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
