function MainLoader_test() {
  new MainLoader().load();
}

class MainLoader {
  load() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const rawJsonsSheet = spreadsheet.getSheetByName('RawJsons');
    const mainSheet = spreadsheet.getSheetByName('Main');

    console.log('Reading raw jsons...');
    const langs = rawJsonsSheet.getRange('A2:A').getValues()
      .map(row => row[0])
      .map(link => link.substring(link.length - 2))
    const notes = rawJsonsSheet.getRange('C2:C').getNotes();
    const items = MainLoader._parseItems(notes, langs);

    console.log('Making headers array...');
    const columns = items.flatMap(item => Object.keys(item));
    const existingColumns = mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues()[0];
    const columnsToAdd = columns.filter(col => !existingColumns.includes(col));

    const actualColumns = existingColumns
      .concat(columnsToAdd)
      .filter((item, i, arr) => arr.indexOf(item) === i);
    console.log(`${actualColumns.length} headers found.`)

    console.log('Making cells list...');
    const cellValues = [];
    for (const item of items) {
      const values = actualColumns.map(col => item[col]);
      cellValues.push(values);
    }

    console.log('Saving...');
    mainSheet.clear();
    mainSheet
      .getRange(1, 1, 1, actualColumns.length)
      .setValues([actualColumns]);
    mainSheet
      .getRange(2, 1, cellValues.length, actualColumns.length)
      .setValues(cellValues);
  }

  static _parseItems(notes, langs) {
    const objects = [];
    for (let i = 0; i < notes.length; i++) {
      if (i % 1000 === 0) {
        console.log(`Processing ${i + 1} / ${notes.length}.`);
      }

      const lang = langs[i];
      const json = notes[i][0];

      const mainObj = MainLoader._extractMainObject(json, lang);
      if (!mainObj['Id']) {
        continue;
      }

      objects.push(mainObj);
    }

    return objects;
  }

  static _extractMainObject(json, lang) {
    if (!json) {
      return {};
    }

    const object = JSON.parse(json);

    const mainObj = {
      Id: object['Id'],
      Lang: lang,
      Name: object['Name'],
    };

    const mainData = object['Main'] || {};
    for (const key in mainData) {
      const val = mainData[key];

      if (Array.isArray(val)) {
        const ids = val
          .map(item => item['Id'])
          .join(',');

        mainObj[key] = ids;
        continue;
      }

      if (typeof (val) === 'object') {
        mainObj[key] = '%some_obj';
        continue;
      }

      mainObj[key] = val;
    }

    return mainObj;
  }
}