/// <reference path="../typings.d.js" />

'use strict';

/** Cleanup files. */
class MaintenanceService {
  /** Creates an instance of MaintenanceService.
   * @param { FileSystemConnector } fileSystemConnector
   * @param { LogManager } logManager
   */
  constructor(fileSystemConnector, logManager) {
    this._logManager = logManager;
    this._fileSystemConnector = fileSystemConnector;

    this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY = 'MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY';
    this._config = {
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  /** Starts the process of cleaning up RAW files.
   * @returns { void }
   */
  run() {
    const startTime = new Date();
    this._deleteObsoleteRawFiles(startTime);
    this._logManager.saveLog(startTime, MaintenanceService.name);
  }

  /** Clears the trash bin.
   * @returns { void }
   */
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

      i += 1;
      if (i % 250 === 0) {
        console.log(`Processing file ${i}. Refreshing continuationToken...`);

        PropertiesService.getScriptProperties().setProperty(
          this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY,
          existingFiles.getContinuationToken(),
        );
      }

      const file = existingFiles.next();
      const fileId = file.getId();
      const isDetached = !knownFiles.has(fileId);
      if (!isDetached) {
        continue;
      }

      PropertiesService.getScriptProperties().setProperty(
        this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY,
        existingFiles.getContinuationToken(),
      );

      console.log(
        `File '${fileId}' is obsolete and will be deleted. `
        + `Name='${file.getName()}' CreatedAt='${file.getDateCreated().toISOString()}'.`,
      );
      file.setTrashed(true);
      deleted += 1;
    }

    const key = this.MAINTENANCE_SERVICE_OLD_FILES_CONTINUATION_TOKEN_PROPERTY_KEY;
    PropertiesService.getScriptProperties()
      .setProperty(key, existingFiles.getContinuationToken());

    console.info(`${i} files processed. ${deleted} files have been deleted.`);
  }

  /** @returns { Set<string> } */
  _getKnownFiles() {
    /** @type { string[] } */
    const knownFilesList = [];
    for (const lang of Object.keys(Constants.supportedLangs())) {
      console.log(`Collecting files for '${lang}'.`);

      const langData = Constants.supportedLangs()[lang];
      const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);

      const files = rawFilesRepository.getActualHtmlFiles().map((x) => x.fileId);
      knownFilesList.push(...files);
    }

    return new Set(knownFilesList);
  }

  /** Checks if the script is timed out.
   * @param { Date } startTime
   * @returns { boolean }
   * @private
   */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}

globalRegister(MaintenanceService);
