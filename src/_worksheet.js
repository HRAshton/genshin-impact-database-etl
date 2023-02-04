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
  Logger.log(DriveApp.createFile('test_empty_file', '').getId());
  Logger.log(DriveApp.createFile('test_empty_file', '').getId());
}