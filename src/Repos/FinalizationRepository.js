class FinalizationRepository {
  /** @param { string } spreadsheetId */
  constructor(spreadsheetId) {
    this._mainSheetName = 'finSheet';
    this._sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(this._mainSheetName);
  }

  /** @param { {key: string, value: string}[] } items */
  saveFinalizationData(items) {
    GenshinHoneyHunterWorldParser.assert(
      items.every((pair) => !!pair.key && !!pair.value),
      'All elements should contain keys or values.',
    );
    GenshinHoneyHunterWorldParser.assert(
      items.length > 5,
      'Too few elements.',
    );

    const keys = items.map((pair) => [pair.key]);
    const notes = items.map((pair) => [pair.value]);

    const range = this._sheet.getRange(1, 1, items.length, 1);
    range.setValues(keys);
    range.setNotes(notes);
  }

  /** @returns { string[] } */
  getAllKeys() {
    const range = this._sheet.getRange('A:A');
    return range.getValues().map((row) => row[0]);
  }

  /** @param { string[] } keys
   *  @returns { {}[] }
   */
  getByIds(keys) {
    const jsons = [];
    const range = this._sheet.getRange('A:A');
    for (const key of keys) {
      const row = Helpers.getRowByText(range, key);
      if (row === undefined) {
        continue;
      }

      const json = this._sheet.getRange(row, 1).getNote();
      jsons.push(json);
    }

    const result = jsons.map((json) => JSON.parse(json));

    return result;
  }
}
