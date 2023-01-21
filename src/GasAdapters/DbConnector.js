async function DbConnector_Tests() {
  try {
    new DbConnector().getParsingResultCellsByUrls(['/i_3/?lang=RU']);
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
    const sheet = this.spreadsheet.getSheetByName('updates_history');

    const pairs = sheet.getRange('A2:B').getValues();
    pairs.sort((pair1, pair2) => pair1[1] - pair2[1]);

    // Logger.log(pairs);
    const urls = pairs.map(pair => ({ url: pair[0], updatedAt: pair[1] }));

    return urls;
  }

  updateUpdatesHistory(url, isFailed) {
    const sheet = this.spreadsheet.getSheetByName('updates_history');

    const date = (isFailed ? new Date('2025-01-01') : new Date()).toISOString();
    const range = sheet.getRange('A:A');
    const updatesHistory = range.getValues();
    const rowIndex = updatesHistory.findIndex(row => row[0] === url);
    if (rowIndex !== -1) {
      // Update
      sheet.getRange(rowIndex + 1, 2).setValue(date);
    } else {
      // Insert
      sheet.appendRow([url, date]);
    }
  }
  /* History: end */

  /* Content: begin */
  getKnownIds() {
    const sheet = this.spreadsheet.getSheetByName('content');
    const idsArrays = sheet.getRange('C2:C').getValues();
    const ids = idsArrays
      .flatMap(arr => arr)
      .filter(id => !!id);

    return ids;
  }

  getParsingResultCellsByUrls(urls) {
    const sheet = this.spreadsheet.getSheetByName('content');

    let results;
    for (const url of urls) {
      const textFinder = sheet.getRange('A2:A').createTextFinder(url).matchCase(true).matchEntireCell(true);
      const matches = textFinder.findAll();
      const rows = matches.map(range => range.getRow());
      results = rows
        .map(row => sheet.getRange(row, 1, 1, 2).getValues())
        .map(row => ({ url: row[0], content: row[1] }));
    }

    return results;
  }

  removeContentByUrl(url) {
    const sheet = this.spreadsheet.getSheetByName('content');
    const urls = sheet.getRange('A2:A').getValues();

    let deletedCount = 0;
    for (let rowIndex = urls.length - 1; rowIndex > 0; rowIndex--) {
      if (urls[rowIndex][0] !== url) {
        continue;
      }

      sheet.deleteRow(rowIndex + 2); // Index starts with 1 ABND there is the header row.
      deletedCount++;
    }

    return deletedCount;
  }

  updateContentWithUrl(chunks) {
    const sheet = this.spreadsheet.getSheetByName('content');

    const lastRow = sheet.getLastRow();
    sheet.insertRowsAfter(lastRow, chunks.length);
    sheet.getRange(lastRow + 1, 1, chunks.length, 3).setValues(chunks);

    return chunks.length;
  }
  /* Content: end */
}