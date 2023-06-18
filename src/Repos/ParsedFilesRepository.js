/// <reference path="../typings.d.js" />

'use strict';

/** Repository for parsed files. */
class ParsedFilesRepository {
  /** Creates an instance of ParsedFilesRepository.
   * @param { string } spreadsheetId - ID of the parsed files spreadsheet.
   */
  constructor(spreadsheetId) {
    this._lock = LockService.getScriptLock();
    this._mainSheetName = 'main';
    this._sheet = SpreadsheetApp.openById(spreadsheetId)?.getSheetByName(this._mainSheetName);
    if (!this._sheet) {
      throw new Error(`Could not find sheet with name ${this._mainSheetName} in spreadsheet ${spreadsheetId}.`);
    }
  }

  /** Gets urls and file ids of all parsed files.
   * @returns { ParsedFileMeta[] }
   */
  getParsedHtmlFiles() {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    const filesData = this._sheet.getRange('A2:B').getValues()
      .filter((val) => val[0] && val[1])
      .map((val) => ({
        url: val[0],
        fileId: val[1],
      }));
    this._lock.releaseLock();

    return filesData;
  }

  /** Saves parsing result to the repository.
   * @param { string } url - URL of the file in Google Drive.
   * @param { string } fileId - ID of the file in Google Drive.
   * @param { string } json - Serialized @link{ GenshinHoneyHunterWorldParser.ParsingResultModel }.
   * @param { string } modifiedAt - Date of the last modification of the file.
   */
  saveParsingResult(url, fileId, json, modifiedAt) {
    this._lock.waitLock(Constants.scriptTimeoutMs());
    const sheet = this._sheet;
    const existingRow = Helpers.getRowByText(sheet.getRange('A2:A'), url);

    let modifiedRow;
    if (existingRow) {
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

  /** Gets all jsons with parsing results.
   * @returns { string[] }
   */
  getAllParsedJsons() {
    this._lock.waitLock(Constants.scriptTimeoutMs());

    const notes = this._sheet
      .getRange('D2:D')
      .getNotes()
      .filter((rowNotes) => !!rowNotes[0])
      .map((rowNotes) => rowNotes[0]);

    this._lock.releaseLock();
    return notes;
  }
}

globalRegister(ParsedFilesRepository);
