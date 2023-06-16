function FinalizationService_tests() {
  const langData = Helpers.getLang(new Date(), 'RU');
  console.info(`Finalization job started for lang '${langData.lang}'`);

  const fileSystemConnector = new FileSystemConnector();
  const logManager = new LogManager(fileSystemConnector);
  const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
  const finalizationRepository = new FinalizationRepository(langData.finSheetId);
  const finalizationService = new FinalizationService(langData.lang, parsedFilesRepository, finalizationRepository, logManager);

  finalizationService.run();
}

class FinalizationService {
  /** @param { stiring } lang
  *   @param { ParsedFilesRepository } parsedFilesRepository
  *   @param { FinalizationRepository } finalizationRepository
  *   @param { LogManager } logManager
  */
  constructor(lang, parsedFilesRepository, finalizationRepository, logManager) {
    this._lang = lang;
    this._parsedFilesRepository = parsedFilesRepository;
    this._finalizationRepository = finalizationRepository;
    this._logManager = logManager;
  }

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

  /** @param { string[] } jsons
   *  @returns { unknown[] }
   */
  _parseItems(jsons) {
    const items = [];
    for (let i = 0; i < jsons.length; i++) {
      const json = jsons[i];
      if (!json) {
        console.info(`Item with index=${i} skipped.`);
        continue;
      }

      if (i % 1000 === 0) {
        console.info(`Processing ${i + 1}/${jsons.length}.`);
      }

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

  _getRelations(tableData, numberOfTables) {
    const key = tableData.Path.map((x) => x.Name);
    if (!key[0]) {
      GenshinHoneyHunterWorldParser.assert(numberOfTables === 1, 'Undefined keys allowed only in list tables.');
      key[0] = 'List';
    }

    const headers = tableData.Headers;
    const values = [];
    for (const row of tableData.Rows) {
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
      obj,
    );

    lastObj[lastKey] = value;
  }
}

globalRegister(FinalizationService);
