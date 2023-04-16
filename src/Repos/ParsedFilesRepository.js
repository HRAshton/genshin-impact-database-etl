class ParsedFilesRepository {
  /** @param { string } spreadsheetId */
  constructor(spreadsheetId) {
    this._lock = LockService.getScriptLock();
    this._mainSheetName = 'main';
    this._sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(this._mainSheetName);
  }

  /** @returns { { url: string, fileId: string }[] } */
  getParsedHtmlFiles() {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    const filesData = this._sheet.getRange('A2:B').getValues()
      .map(val => ({
        url: val[0],
        fileId: val[1],
      }));
    this._lock.releaseLock();

    return filesData;
  }

  /** @param { string } url
   *  @param { string } fileId
   *  @param { string } json
   *  @param { string } modifiedAt
   */
  saveParsingResult(url, fileId, json, modifiedAt) {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    const sheet = this._sheet;
    const existingRow = Helpers.getRowByText(sheet.getRange('A2:A'), url);

    let modifiedRow;
    if (!!existingRow) {
      modifiedRow = existingRow;

      sheet
        .getRange(modifiedRow, 2, 1, 2)
        .setValues([[fileId, modifiedAt]]);
    } else {
      const lastRow = sheet.getLastRow();
      sheet.insertRowsAfter(lastRow, 1);

      modifiedRow = lastRow + 1;

      sheet
        .getRange(modifiedRow, 1, 1, 4)
        .setValues([[
          url,
          fileId,
          modifiedAt,
          'content',
        ]]);
    }

    sheet.getRange(modifiedRow, 4).setNote(json);
    this._lock.releaseLock();
  }

  /** @returns { string[] } */
  getAllParsedJsons() {
    this._lock.waitLock(Constants.scriptTimeoutMs());

    const notes = this._sheet
      .getRange('D2:D')
      .getNotes()
      .map(notes => notes[0]);

    this._lock.releaseLock();
    return notes;
  }

  /** @returns { {json: string, row: number}[] } */
  getJsonsWithRowNumbers() {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    const res = this.getAllParsedJsons()
      .map((json, index) => ({ json, row: index + 2 }));
    this._lock.releaseLock();

    return res;
  }

  /** @param { number[] } rowNumbers */
  clearRows(rowNumbers) {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    for (const rowNumber of rowNumbers) {
      this._sheet.deleteRows(rowNumber, 1);
    }
    this._lock.releaseLock();
  }
}