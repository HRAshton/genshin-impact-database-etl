/// <reference path="../typings.d.js" />

'use strict';

/** Stores statistics to the dashboard spreadsheet. */
class DashboardRepository {
  /** Creates a new instance of the DashboardRepository.
   * @param { string } spreadsheetId - ID of the dashboard spreadsheet.
   */
  constructor(spreadsheetId) {
    this._mainSheetName = 'stats';
    this._sheet = SpreadsheetApp.openById(spreadsheetId)?.getSheetByName(this._mainSheetName);
    if (!this._sheet) {
      throw new Error(`Could not find sheet with name ${this._mainSheetName} in spreadsheet ${spreadsheetId}.`);
    }
  }

  /** Saves data to the spreadsheet.
   * @param { DashboardStatisticsEntry[] } data - Data to save.
   * @returns { void }
   */
  saveData(data) {
    const cells = [];
    for (const langData of data) {
      cells.push([
        langData.langCode, // Lang
        langData.extractData.files, // Files
        langData.extractData.empty, // Empty
        langData.extractData.outdated, // Outdated
        langData.extractData.actual, // Actual
        langData.extractData.oldest, // Oldest
        langData.extractData.median, // Middle
        langData.extractData.newest, // Newest
        langData.transformData.total, // Files
        langData.transformData.successful, // Successful
        langData.transformData.unsuccessful, // Not successful
        langData.finalizationData.total,
        langData.isCurrent ? '•' : '',
      ]);
    }

    this._sheet.getRange(3, 1, cells.length, cells[0].length).setValues(cells);
  }
}

globalRegister(DashboardRepository);
