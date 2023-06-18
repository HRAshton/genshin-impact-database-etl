/// <reference path="../typings.d.js" />

'use strict';

/** Transforms parsed jsons into final jsons and saves them to the finalization repository. */
class FinalizationService {
  /** Creates an instance of FinalizationService.
   * @param { string } lang
   * @param { ParsedFilesRepository } parsedFilesRepository
   * @param { FinalizationRepository } finalizationRepository
   * @param { LogManager } logManager
   */
  constructor(lang, parsedFilesRepository, finalizationRepository, logManager) {
    this._lang = lang;
    this._parsedFilesRepository = parsedFilesRepository;
    this._finalizationRepository = finalizationRepository;
    this._logManager = logManager;
  }

  /** Runs the finalization process.
   * @returns { void }
   */
  run() {
    const startTime = new Date();

    console.log('Fetching raw jsons...');
    const notes = this._parsedFilesRepository.getAllParsedJsons();

    console.log('Parsing items...');
    const items = this._parseItems(notes);

    console.log('Saving...');
    const pairs = items
      .map((item) => ({
        key: `${this._lang}/${item.Id}`,
        value: JSON.stringify(item),
      }));

    this._finalizationRepository.saveFinalizationData(pairs);
    console.info(`${pairs.length} items finalized.`);

    this._logManager.saveLog(startTime, FinalizationService.name);
  }

  /** Parses jsons into items.
   * @param { string[] } jsons
   * @returns { FinalizedEntry[] }
   * @private
   */
  _parseItems(jsons) {
    /** @type { FinalizedEntry[] } */
    const items = [];
    for (let i = 0; i < jsons.length; i += 1) {
      const json = jsons[i];
      if (!json) {
        console.info(`Item with index=${i} skipped.`);
        continue;
      }

      if (i % 1000 === 0) {
        console.info(`Processing ${i + 1}/${jsons.length}.`);
      }

      /** @type { GenshinHoneyHunterWorldParser.ParsingResultModel } */
      const obj = JSON.parse(json);
      if (!obj || !obj.Id || !obj.Name) {
        console.info(`Item with index=${i} has no id.`);
        continue;
      }

      const item = {
        Id: obj.Id,
        Name: obj.Name,
        Main: obj.Main || {},
        Metadata: obj.Metadata,
      };

      const tables = obj.Tables;
      for (const tableData of tables || []) {
        const { key, values } = this._getRelations(tableData, tables.length);

        this._setNestedProperty(item, key, values);
      }

      items.push(item);
    }

    return items;
  }

  /** Transforms the table data into the nested object and returns it with the key.
   * It replaces headers+rows structure with the nested object.
   * Table key is array of names of sections from the root to the table.
   * @param { GenshinHoneyHunterWorldParser.TableModel } tableData
   * @param { number } numberOfTables
   * @returns {{ key: string[], values: object[] }} - Names of sections to the table
   *          and object represents the table.
   * @private
   */
  _getRelations(tableData, numberOfTables) {
    const key = tableData.Path.map((x) => x.Name);
    if (!key[0]) {
      assert(numberOfTables === 1, 'Undefined keys allowed only in list tables.'); // todo Replace with helper
      key[0] = 'List';
    }

    const headers = tableData.Headers;
    /** @type { object[] } */
    const values = [];
    for (const row of tableData.Rows) {
      /** @type { Record<string, GenshinHoneyHunterWorldParser.TableCellContent> } */
      const value = {};

      for (let colIndex = 0; colIndex < headers.length; colIndex += 1) {
        const header = headers[colIndex];
        value[header] = row[colIndex];
      }

      values.push(value);
    }

    return { key, values };
  }

  /** Sets the value to the nested property of the object.
   * @param { object } obj - Object to set the value to.
   * @param { string[] } path - Path to the property.
   * @param { any } value - Value to set.
   * @private
   */
  // From https://stackoverflow.com/a/11433067
  _setNestedProperty(obj, path, value) {
    const keys = [...path];
    const lastKey = keys.pop();
    const lastObj = keys.reduce(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign,no-return-assign
      (item, key) => item[key] = item[key] || {},
      obj,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lastObj[lastKey] = value;
  }
}

globalRegister(FinalizationService);
