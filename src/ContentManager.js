class ContentManager {
  constructor(dbConnector) {
    this.dbConnector = dbConnector;
  }

  getKnownIds() {
    return this.dbConnector.getKnownIds()
      .flatMap(row => row.split(','))
      .filter((id, i, arr) => arr.indexOf(id) === i);
  }

  getParsingResultsByIds(ids, lang) {
    const urls = ids.map(id => `/${id}/?lang=${lang}`);
    Logger.log('Urls created.');

    const cellsContent = this.dbConnector.getRawJsons(urls);
    Logger.log('Cells fetched.');

    const objects = cellsContent.map(json => JSON.parse(json));
    Logger.log('Objects parsed.');

    return objects;
  }

  updateParsingResult(url, parsingResult) {
    const json = JSON.stringify(parsingResult);
    const hash = this._hashStr(json);

    const isRawJsonExists = this.dbConnector.checkIfRawJsonExists(url, hash);
    if (isRawJsonExists) {
      Logger.log(`Data has now changed and skipped: '${url}'.`);

      return false;
    }
    const entityIds = this._getEntityIds(parsingResult)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .join(',');

    this.dbConnector.setRowJson(url, json, entityIds, hash, new Date());

    Logger.log(`Content saved with hash '${hash}'.`);
    return true;
  }

  _getEntityIds(parsingResult) {
    if (!parsingResult || typeof parsingResult !== 'object') {
      return [];
    }

    const entityIds = [];

    if (parsingResult.Id) {
      entityIds.push(parsingResult.Id);
    }

    for (const value of Object.values(parsingResult)) {
      const ids = this._getEntityIds(value);
      entityIds.push(...ids);
    }

    return entityIds;
  }

  _hashStr(str) {
    for (var i = 0, h = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }

    return h;
  }
}