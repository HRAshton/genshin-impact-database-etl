function FinLoader_tests() {
  const dbConnector = new DbConnector();
  const finLoader = new FinLoader(dbConnector);

  finLoader.load();
}

class FinLoader {
  constructor(dbConnector) {
    this._dbConnector = dbConnector;
  }

  load() {
    console.info('Fetching raw jsons...');
    const notes = this._dbConnector.getAllRawJsons();

    console.info('Parsing items...');
    const items = this._parseItems(notes);

    console.info('Saving...');
    const keys = items.map(item => [`${item['Metadata'] ? item['Metadata']['Locale'] : null}/${item['Id']}`]);
    const jsons = items.map(item => [JSON.stringify(item)]);
    this._dbConnector.saveFinalizationData(keys, jsons);

    console.info('Done.');
  }

  _parseItems(notes) {
    const items = [];
    for (let i = 0; i < notes.length; i++) {
      const json = notes[i][0];
      if (!json) {
        console.info(`Item with index=${i} skipped.`);
        continue;
      }

      if (i % 1000 === 0) {
        console.info(`Processing ${i + 1}/${notes.length}.`);
      }

      const obj = JSON.parse(json);

      const item = {
        'Id': obj['Id'],
        'Name': obj['Name'],
        'Main': obj['Main'] || {},
        'Metadata': obj['Metadata'],
      }

      const tables = obj['Tables'];
      for (const tableData of tables || []) {
        const { key, values } = this._getRelations(tableData, tables.length);

        this._setNestedProperty(item, key, values);
      }

      items.push(item);
    }

    return items;
  }

  _getRelations(tableData, numberOfTables) {
    const key = tableData['Path'].map(x => x['Name']);
    if (!key[0]) {
      GenshinHoneyHunterWorldParser.assert(numberOfTables === 1, 'Undefined keys allowed only in list tables.');
      key[0] = 'List'
    }

    const headers = tableData['Headers'];
    const values = [];
    for (const row of tableData['Rows']) {
      const value = {};

      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const header = headers[colIndex];
        value[header] = row[colIndex];
      }

      values.push(value);
    }

    return { key, values };
  }

  // From https://stackoverflow.com/a/11433067
  _setNestedProperty(obj, path, value) {
    const keys = [...path];
    const lastKey = keys.pop();
    const lastObj = keys.reduce(
      (obj, key) => obj[key] = obj[key] || {},
      obj);

    lastObj[lastKey] = value;
  }
}