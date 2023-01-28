function printUnknownColumns() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Logs');
  const cells = sheet.getRange('A2:A').getNotes();
  const logs = cells
    .map(row => row[0])
    .join('\n')
    .split('\n');

  const unexpectedColumnLogs = logs
    .filter(log => log.includes('Unexpected column name'))
    .map(x => x.split('Unexpected column name')[1]);

  console.warn(Array.from(new Set(unexpectedColumnLogs)));
}

function migrateToHex() {
  const spreadsheet = SfgpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('RawJsons');
  const range = sheet.getRange('E2:E');
  const values = range.getValues();
  for (let i = 1; i < values.length; i++) {
    values[i][0] = parseInt(values[i][0].toString()).toString(16);
  }

  range.setValues(values);
}