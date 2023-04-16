function do_nothing() {
  throw new Error('Do not call me.');
}

function removeFile() {
  Drive.Files.emptyTrash()
}

function clearfyParsedSheet() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    //if (langData.parsedSheetId != '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk') continue;

    const parsedSheet = SpreadsheetApp.openById(langData.parsedSheetId).getSheets()[0];
    const range = parsedSheet.getRange('A:B');
    const values = range.getValues().map((x, i) => ({ row: i + 1, ul: x[0], fileId: x[1] }));
    const empty = values.filter(x => !x.ul || !x.fileId);

    for (const row of empty.reverse()) {
      parsedSheet.deleteRow(row.row);
      Logger.log([row.ul, row.fileId, row.row]);
    }

    Logger.log(values[0][0]);
  }
}

function addUrlColumnToParsedTable() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    if (langData.parsedSheetId != '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk') continue;

    const rawSheet = SpreadsheetApp.openById(langData.rawSheetId).getSheets()[0];
    const parsedSheet = SpreadsheetApp.openById(langData.parsedSheetId).getSheets()[0];

    parsedSheet.insertColumnBefore(1);
    parsedSheet.getRange('A1').setValue('url');
    parsedSheet.setColumnWidth(1, 250);

    const rawFiles = rawSheet.getRange('A2:B').getValues();

    const range = parsedSheet.getRange('A2:B');
    const values = range.getValues();
    for (const value of values) {
      const rawRow = rawFiles.find(x => x[1] === value[1]);
      value[0] = rawRow ? rawRow[0] : '';
    }

    const t = values.filter(x => !!x[0]);

    range.setValues(values);
    Logger.log(values[0][0]);
  }
}

function removeParsedColumn() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    if (langData.parsedSheetId != '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk') continue;
    const rawSheet = SpreadsheetApp.openById(langData.rawSheetId).getSheets()[0];
    rawSheet.deleteColumn(5);
    Logger.log(1);
  }
}

function nullifyUnarsedValues() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    // if (langData.parsedSheetId != '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk') continue;
    const rawSheet = SpreadsheetApp.openById(langData.rawSheetId).getSheets()[0];
    const rawRange = rawSheet.getRange('E2:E');
    const values = rawRange.getValues();
    for (const value of values) {
      value[0] = !value[0] ? null : 'success';
    }

    rawRange.setValues(values);
    Logger.log(values[0][0]);
  }
}

function addParsedColumnToRawTable() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    // if (langData.parsedSheetId != '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk') continue;
    const rawSheet = SpreadsheetApp.openById(langData.rawSheetId).getSheets()[0];
    rawSheet.insertColumnAfter(4);
    rawSheet.getRange('E1').setValue('parsed');
    rawSheet.setColumnWidth(5, 51);

    const parsedSheet = SpreadsheetApp.openById(langData.parsedSheetId).getSheets()[0]
    const parsedFiles = new Set(parsedSheet.getRange('A:A').getValues().map(x => x[0]));

    const rawRange = rawSheet.getRange('A2:F');
    const values = rawRange.getValues();
    for (const value of values) {
      value[4] = parsedFiles.has(value[1]);
    }

    rawRange.setValues(values);
    Logger.log(values[0][0]);
  }
}

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

function expandSheets() {
  for (const lang of Object.keys(Constants.supportedLangs())) {
    const src = DriveApp.getFileById('15-8cEEvxCaeb2vCbdNh_Qp3cKwSlxg2nqgAVtCIZ04Q');
    const dst = DriveApp.getFolderById('17rJISRy-FcRpBKpJQU61cy46B5sugSBs');
    const file = src.makeCopy('RAW ' + lang + ' :: Genshin Impact DB Parsed', dst);
    Logger.log([file.getId(), lang]);
  }
}

function clearSheets() {
  for (const lang of Object.values(Constants.supportedLangs())) {
    const sheet = SpreadsheetApp.openById(lang.parsedSheetId);
    sheet.getSheetByName('main').getRange('A2:C').clear();
    sheet.getSheetByName('main').getRange('A2:C').clearNote();
    try {
      sheet.getSheetByName('main').deleteRows(2, sheet.getSheetByName('main').getMaxRows() - 2);
    }
    catch {

    }
  }
}

function fillSheets() {
  for (const lang of Object.keys(Constants.supportedLangs())) {
    const langData = Constants.supportedLangs()[lang];
    const sheet = SpreadsheetApp.openById(langData.rawSheetId);
    sheet.getRange('A2:E2').setValues([['/hs_40/?lang=' + lang, '', '', '', new Date().toISOString()]])
  }
}

function testGzip() {
  var r = DriveApp.getFolderById('1FpnRg7guRdOs8kJZv2sxUC2ybNaKDkcu').getFiles();
  while (r.hasNext()) {
    var t = r.next()
    const rawBlob = t.getBlob();
    Logger.log([rawBlob.getBytes().length, Utilities.gzip(rawBlob).getBytes().length])
  }
}

function getLogsStats() {
  const t = DriveApp.getFolderById('1WfETeFgi5x58v29pHBaZx43e-X9ESz3V').getFiles();
  const list = [];
  while (t.hasNext()) {
    const file = t.next();
    list.push([new Date().toISOString(), file.getDateCreated().getTime(), file.getSize()])
    console.log([new Date().toISOString(), list.length])
  }

  DriveApp.createFile('logsStats.csv', list.map(x => x.join(',')).join(`\n`));
}

function packLogs() {
  const folder = DriveApp.getFolderById('1WfETeFgi5x58v29pHBaZx43e-X9ESz3V');
  const t = folder.searchFiles(`mimeType = 'text/plain'`);
  let i = 0;
  while (t.hasNext()) {
    i++;
    const file = t.next();
    const name = file.getName();
    if (!name.endsWith('.log')) {
      continue;
    }

    Logger.log('Packing log file ' + name);
    const blob = Utilities.newBlob(file.getBlob().getBytes(), 'text/plain', name);
    const cBlob = Utilities.gzip(blob, name + '.gz');
    folder.createFile(cBlob);
    file.setTrashed(true);
  }

  console.log(i);
}

function renameSheets() {
  for (const langData of Object.values(Constants.supportedLangs())) {
    SpreadsheetApp.openById(langData.finSheetId).getSheets()[0].setName('finSheet');
  }
}

function deleteBadUrls() {
  const idRegex = /^[0-9a-z_]+$/;
  for (const langData of Object.values(Constants.supportedLangs())) {
    const sheet = SpreadsheetApp.openById(langData.rawSheetId).getSheets()[0];
    const t = sheet.getRange('A:A').getValues()
      .map((val, i) => ({ url: val[0], row: i + 1, id: val[0].split('/')[1] }))
      .filter(x => x.row > 1);
    const bad = t.filter(x => !x.id.match(idRegex)).sort((a, b) => b.row - a.row);

    console.log(bad.length);
    for (const y of bad) {
      sheet.deleteRow(y.row)
    }
  }
}