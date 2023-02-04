class FileSystemConnector {
  constructor() {
    this._config = {
      folderId: '1hYJbORnlJuw416mwWBTAjZd03aT1-cYx',
    }
  }

  getFilesWithModificationDates() {
    const htmlsFolder = this._getHtmlsFolder();
    const files = htmlsFolder.getFiles();

    const obj = [];
    while (files.hasNext()) {
      const file = files.next();

      obj.push({
        fileId: file.getId(),
        modifiedAt: file.getLastUpdated(),
      });
    }

    return obj;
  }

  /**
   * @param {string} fileName
   * @param {string} text
   * @returns {string} fileId
   */
  createFile(fileName, text) {
    const htmlsFolder = this._getHtmlsFolder();

    const fileId = htmlsFolder.createFile(fileName, text).getId();

    return fileId;
  }

  /**
   * @param {string} fileId
   * @param {string} text
   */
  writeAllText(fileId, text) {
    DriveApp
      .getFileById(fileId)
      .setContent(text);
  }

  /**
   * @param {string} fileId
   * @returns {string} content
   */
  readAllText(fileId) {
    return DriveApp
      .getFileById(fileId)
      .getBlob()
      .getDataAsString();
  }

  _getHtmlsFolder() {
    if (!this._htmlsFolder) {
      this._htmlsFolder = DriveApp.getFolderById(this._config.folderId);
    }

    return this._htmlsFolder;
  }
}