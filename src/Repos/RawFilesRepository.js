/// <reference path="../typings.d.js" />

'use strict';

/** Stores metadata of raw files in the spreadsheets. */
class RawFilesRepository {
  /** Creates a new instance of the RawFilesRepository.
   * @param { string } spreadsheetId - ID of the spreadsheet.
   */
  constructor(spreadsheetId) {
    this._mainSheetName = 'main';
    this._sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(this._mainSheetName);
    if (!this._sheet) {
      throw new Error(`Could not find sheet with name ${this._mainSheetName} in spreadsheet ${spreadsheetId}.`);
    }
  }

  /** Gets data about the raw HTML files.
   * @returns { RawHtmlMetaEntry[] }
   */
  getKnownPages() {
    /** @type { RawHtmlMetaEntry[] } */
    const pairs = this._sheet.getRange('A2:C').getValues()
      .map((val) => ({
        url: val[0],
        fileId: val[1],
        modifiedAt: val[2],
      }))
      .filter((val) => !!val.url);

    return pairs;
  }

  /** Gets all known urls from raw files metadata.
   * @returns { string[] }
   */
  getKnownUrls() {
    /** @type { string[] } */
    const urls = this._sheet.getRange('A2:A').getValues()
      .map((x) => x[0])
      .filter((val) => !!val);

    return urls;
  }

  /** Gets data about the raw HTML files with fetching statuses.
   * @returns { RawHtmlMetaWithStatus[] }
   */
  getActualHtmlFiles() {
    /** @type { RawHtmlMetaWithStatus[] } */
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

  /** Appends urls to the end of the sheet.
   * @param { NewRawHtmlMetaEntry[] } cells
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
   * @param { string } url
   * @param { string } modifiedAt
   * @param { string } status
   * @param { string } fileId
   * @returns { void }
   */
  saveExtractingResult(url, modifiedAt, status, fileId) {
    const row = Helpers.getRowByText(this._sheet.getRange('A2:A'), url);
    if (!row) {
      throw new Error(`Could not find row with url ${url}.`);
    }

    this._sheet
      .getRange(row, 2, 1, 3)
      .setValues([[fileId, modifiedAt, status]]);
  }
}

globalRegister(RawFilesRepository);
