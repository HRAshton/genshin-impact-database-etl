function MaintenanceService_tests() {
  const dbConnector = new DbConnector();
  const fileSystemConnector = new FileSystemConnector()
  const ms = new MaintenanceService(dbConnector, fileSystemConnector);
  ms.run();
}

class MaintenanceService {
  constructor(dbConnector, fileSystemConnector) {
    this._dbConnector = dbConnector;
    this._fileSystemConnector = fileSystemConnector;
  }

  run() {
    this._deleteDetachedHtmls();
  }

  _deleteDetachedHtmls() {
    const registeredFileIds = new Set(
      this._dbConnector.getActualHtmlFiles().map(file => file[0]));

    const existingFiles = this._fileSystemConnector.getFilesWithModificationDates();

    const previousHourTimestamp = new Date().getTime() - 3600;
    for (const { fileId, modifiedAt } of existingFiles) {
      if (registeredFileIds.has(fileId)) {
        continue;
      }

      if (modifiedAt.getTime() > previousHourTimestamp) {
        continue;
      }

      this._fileSystemConnector.deleteFile(fileId);
      Logger.log(`Detached file found: '${fileId}' and deleted.`);
    }
  }
}