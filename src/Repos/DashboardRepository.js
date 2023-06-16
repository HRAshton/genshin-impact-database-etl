class DashboardRepository {
  /** @param { string } spreadsheetId */
  constructor(spreadsheetId) {
    this._mainSheetName = 'stats';
    this._sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(this._mainSheetName);
  }

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

  moveStats() {
    const histSheet = this._sheet.getParent().getSheetByName('history');
    const langs = this._sheet.getRange('A3:A').getValues();
    const numbers = this._sheet.getRange('D3:E').getValues();
    const date = new Date();

    const cells = langs.map((langRow, i) => [date, langRow[0], ...numbers[i]]);
    console.log(cells);

    cells.forEach((row) => histSheet.appendRow(row));
  }
}

globalRegister(DashboardRepository);
