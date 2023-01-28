async function DbConnector_Tests() {
  try {
    new DbConnector().getRawJsons(['/i_3/?lang=RU']);
  } catch (ex) {
    Logger.log(ex);
    throw ex;
  }
}

class DbConnector {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }

  /* History: begin */
  getUpdatesHistory() {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');

    const urls = sheet.getRange('A2:A').getValues();
    const checkedAtDates = sheet.getRange('G2:G').getValues();

    const pairs = urls.map((_, i) => ({ url: urls[i][0], updatedAt: checkedAtDates[i] }));
    pairs.sort((pair1, pair2) => pair1.updatedAt - pair2.updatedAt);

    return pairs;
  }

  updateUpdatesHistory(url, isFailed) {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');

    const date = (isFailed ? new Date('2025-01-01') : new Date()).toISOString();
    const row = this._getRowByText(sheet.getRange('A2:A'), url);

    sheet.getRange(row, 7).setValue(date);
  }
  /* History: end */

  /* Content: begin */
  getKnownIds() {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');
    const idsArrays = sheet.getRange('D2:D').getValues();
    const ids = idsArrays
      .map(arr => arr[0])
      .filter(id => !!id);

    return ids;
  }

  checkIfRawJsonExists(url, hash) {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');

    const row = this._getRowByText(sheet.getRange('E2:E'), hash);
    if (!row) {
      return false;
    }

    const exists = sheet.getRange(row, 1).getValue() === url;

    return exists;
  }

  getAllRawJsons() {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');
    const notes = sheet
      .getRange('C2:C')
      .getNotes();

    return notes;
  }

  getRawJsons(urls) {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');

    const content = [];
    for (const url of urls) {
      const row = this._getRowByText(sheet.getRange('A2:A'), url);
      if (!row) {
        continue;
      }

      const json = sheet.getRange(row, 3).getNote();

      content.push(json);
    }

    return content;
  }

  setRowJson(url, json, entityIds, hash, date) {
    const sheet = this.spreadsheet.getSheetByName('RawJsons');

    const existingRow = this._getRowByText(sheet.getRange('A2:A'), url);
    let modifiedRow;
    if (!!existingRow) {
      modifiedRow = existingRow;

      sheet
        .getRange(modifiedRow, 4, 1, 3)
        .setValues([[
          entityIds,
          hash,
          date.toISOString(),
        ]]);
    } else {
      const lastRow = sheet.getLastRow();
      sheet.insertRowsAfter(lastRow, 1);

      modifiedRow = lastRow + 1;

      sheet
        .getRange(modifiedRow, 1, 1, 6)
        .setValues([[
          url,
          date.toISOString(),
          'content',
          entityIds,
          hash,
          date.toISOString(),
        ]]);
    }

    sheet.getRange(modifiedRow, 3).setNote(json);
  }
  /* Content: end */

  /* Log: begin */
  saveLog(startTime, log) {
    const sheet = this.spreadsheet.getSheetByName('Logs');

    sheet.deleteRow(30000);
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1).setValue(startTime);
    sheet.getRange(1, 1).setNote(log);
  }
  /* Log: end */

  /* Fin: begin */
  saveFinalizationData(keys, items) {
    const finSheet = this.spreadsheet.getSheetByName('Fin');
    GenshinHoneyHunterWorldParser.assert(
      keys.length === items.length,
      'Keys should have same length as notes.');

    const range = finSheet.getRange(1, 1, items.length, 1);
    range.setValues(keys);
    range.setNotes(items);
  }
  /* Fin: end */

  _getRowByText(range, text) {
    const textFinder = range
      .createTextFinder(text)
      .matchCase(true)
      .matchEntireCell(true);
    const match = textFinder.findNext();
    const row = match?.getRow();

    return row;
  }
}