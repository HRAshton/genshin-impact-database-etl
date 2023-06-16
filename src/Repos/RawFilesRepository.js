class RawFilesRepository {
  /** @param { string } spreadsheetId */
  constructor(spreadsheetId) {
    this._mainSheetName = 'main';
    this._sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(this._mainSheetName);
  }

  /** @returns { {url: string, fileId: string, modifiedAt: string }[] } */
  getKnownPages() {
    const pairs = this._sheet.getRange('A2:C').getValues()
      .map((val) => ({
        url: val[0],
        fileId: val[1],
        modifiedAt: val[2],
      }))
      .filter((val) => !!val.url);

    return pairs;
  }

  /** @returns { string[] } */
  getKnownUrls() {
    const urls = this._sheet.getRange('A2:A').getValues()
      .map((x) => x[0])
      .filter((val) => !!val);

    return urls;
  }

  /** @returns { { url: string, fileId: string, modifiedAt: string, status: string }[] } */
  getActualHtmlFiles() {
    const fileIds = this._sheet.getRange('A2:D').getValues()
      .map((val) => ({
        url: val[0],
        fileId: val[1],
        modifiedAt: val[2],
        status: val[3],
      }))
      .filter((val) => !!val.fileId);

    return fileIds;
  }

  /** Appends urls.
   * @param { {url: string, createdAt: string}[] } cells
   */
  addUrls(cells) {
    const cellsArr = cells.map((cellData) => [
      cellData.url,
      '',
      '',
      '',
      cellData.createdAt,
    ]);

    const lastRow = this._sheet.getLastRow();
    this._sheet
      .getRange(lastRow + 1, 1, cellsArr.length, cellsArr[0].length)
      .setValues(cellsArr);
  }

  /** Saves html.
   * @param {string} url
   * @param {string} modifiedAt
   * @param {string} status
   * @param {string} fileId
   */
  saveExtractingResult(url, modifiedAt, status, fileId) {
    const row = Helpers.getRowByText(this._sheet.getRange('A2:A'), url);

    this._sheet
      .getRange(row, 2, 1, 3)
      .setValues([[fileId, modifiedAt, status]]);
  }
}

globalRegister(RawFilesRepository);
