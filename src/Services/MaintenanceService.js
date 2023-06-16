function MaintenanceService_tests() {
  try {
    const langData = Helpers.getLang(new Date());
    console.info(`Maintenance job started for lang '${langData.lang}'`);

    const fileSystemConnector = new FileSystemConnector();
    const logManager = new LogManager(fileSystemConnector);
    const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
    const maintenanceService = new MaintenanceService(fileSystemConnector, logManager, parsedFilesRepository);

    maintenanceService.run();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

class MaintenanceService {
  /** @param { FileSystemConnector } fileSystemConnector
  *   @param { LogManager } logManager
  */
  constructor(fileSystemConnector, logManager) {
    this._logManager = logManager;
    this._fileSystemConnector = fileSystemConnector;

    this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY = 'MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY';
    this._config = {
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  run() {
    const startTime = new Date();
    this._deleteObsoleteRawFiles(startTime);
    this._logManager.saveLog(startTime, MaintenanceService.name);
  }

  clearTrashBin() {
    const startTime = new Date();

    console.info('Emptying trash bin.');
    this._fileSystemConnector.clearTrashBin();
    console.info('Trash bin emptied.');

    this._logManager.saveLog(startTime, MaintenanceService.name);
  }

  /** @param { Date } startTime */
  _deleteObsoleteRawFiles(startTime) {
    const knownFiles = this._getKnownFiles();

    const latestContinuationToken = PropertiesService.getScriptProperties()
      .getProperty(this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY);
    const existingFiles = this._fileSystemConnector.getOldFiles(latestContinuationToken);

    let i = 0;
    let deleted = 0;
    while (existingFiles.hasNext()) {
      if (this._isTimedOut(startTime)) {
        console.info('Break due to timeout.');
        break;
      }

      if (++i % 250 === 0) {
        console.log(`Processing file ${i}. Refrashing continuationToken...`);

        PropertiesService.getScriptProperties()
          .setProperty(this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY, existingFiles.getContinuationToken());
      }

      const file = existingFiles.next();
      const fileId = file.getId();
      const isDetached = !knownFiles.has(fileId);
      if (!isDetached) {
        continue;
      }

      PropertiesService.getScriptProperties()
        .setProperty(this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY, existingFiles.getContinuationToken());

      console.log(
        `File '${fileId}' is obsolete and will be deleted. `
        + `Name='${file.getName()}' CreatedAt='${file.getDateCreated().toISOString()}'.`,
      );
      file.setTrashed(true);
      deleted++;
    }

    const key = this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY;
    PropertiesService.getScriptProperties()
      .setProperty(key, existingFiles.getContinuationToken());

    console.info(`${i} files processed. ${deleted} files have been deleted.`);
  }

  /** @returns { Set<string> } */
  _getKnownFiles() {
    const knownFilesList = [];
    for (const lang in Constants.supportedLangs()) {
      console.log(`Collecting files for '${lang}'.`);

      const langData = Constants.supportedLangs()[lang];
      const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);

      const files = rawFilesRepository.getActualHtmlFiles().map((x) => x.fileId);
      knownFilesList.push(...files);
    }

    return new Set(knownFilesList);
  }

  /** @param { Date } startTime */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}
