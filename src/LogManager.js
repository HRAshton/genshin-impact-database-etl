class LogManager {
  /** @param { FileSystemConnector } fileSystemConnector */
  constructor(fileSystemConnector) {
    this._fileSystemConnector = fileSystemConnector;
  }

  /** @param { Date } startTime
   *  @param { string } serviceName
   */
  saveLog(startTime, serviceName) {
    const log = Logger.getLog();
    const folder = DriveApp.getFolderById(Constants.logsFolderId());
    const fileName = `${serviceName}_${startTime.toISOString()}.log`;

    const rawBlob = Utilities.newBlob(log, 'text/plain', fileName);
    const compressedBlob = Utilities.gzip(rawBlob, fileName + '.gz');

    folder.createFile(compressedBlob);
  }
}