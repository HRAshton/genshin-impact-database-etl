class FileSystemConnector {
  constructor() {
    /** @type { DriveApp.Folder } */
    this._htmlsFolder = null;

    this._config = {
      folderId: Constants.rawFilesFolderId(),
      rawFilesRetentionPeriodSecs: Constants.rawFilesRetentionPeriodSecs(),
    }
  }

  /** @param { string } continuationToken
   *  @returns { DriveApp.FileIterator } */
  getOldFiles(continuationToken) {
    const htmlsFolder = this._getHtmlsFolder();

    let iterator;
    if (!!continuationToken) {
      console.log('continuationToken received. Trying to restore the iterator.');
      try {
        const prevIterator = DriveApp.continueFileIterator(continuationToken);
        if (prevIterator.hasNext()) {
          iterator = prevIterator;
        }
      } catch (error) {
        console.log(`Iterator restoring error: ${error}.`);
      }
    }

    if (!iterator) {
      const criticalDate = new Date(new Date().getTime() - this._config.rawFilesRetentionPeriodSecs * 1000);
      const query = `modifiedDate < '${criticalDate.toISOString()}'`;
      iterator = htmlsFolder.searchFiles(query);

      console.log('New iterator created.');
    }

    return iterator;
  }

  /**
   * @param { string } fileName
   * @param { string } text
   * @returns { string } fileId
   */
  createFile(fileName, text) {
    const htmlsFolder = this._getHtmlsFolder();

    const compressedFileName = fileName + '.gz';
    console.info(`Creating file '${compressedFileName}'...`);

    const blob = Utilities.newBlob(text);
    const compressedBlob = Utilities.gzip(blob, compressedFileName);
    const fileId = htmlsFolder.createFile(compressedBlob).getId();

    return fileId;
  }

  /**
   * @param { string } fileId
   * @returns { string } content
   */
  readAllText(fileId) {
    const file = DriveApp.getFileById(fileId);

    const compressedBlob = file.getBlob();
    const actualBlob = Utilities.ungzip(compressedBlob);

    return actualBlob.getDataAsString();
  }

  clearTrashBin() {
    Drive.Files.emptyTrash();
  }

  /** @returns { DriveApp.Folder } */
  _getHtmlsFolder() {
    if (!this._htmlsFolder) {
      this._htmlsFolder = DriveApp.getFolderById(this._config.folderId);
    }

    return this._htmlsFolder;
  }
}