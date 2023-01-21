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

    const cellsContent = this.dbConnector.getParsingResultCellsByUrls(urls);
    if (!cellsContent || !cellsContent.length) {
      throw new Error(`Entity with id '${ids}' not found.`);
    }
    Logger.log('Cells fetched.');

    const jsonsParts = {};
    for (const pair of cellsContent) {
      if (!jsonsParts[pair.url]) {
        jsonsParts[pair.url] = [];
      }

      jsonsParts[pair.url].push(pair.content);
    }
    Logger.log('Jsons grouped.');

    const jsons = Object.values(jsonsParts)
      .map(parts => parts.join(''))
      .filter(json => !!json);
    Logger.log('Jsons joined.');

    const objects = jsons.map(json => JSON.parse(json));
    Logger.log('Objects parsed.');

    return objects;
  }

  updateParsingResult(url, parsingResult) {
    const deletedCount = this.dbConnector.removeContentByUrl(url);
    Logger.log(`${deletedCount} rows of content deleted.`);

    const chunkSize = 50000; // Max length of Google Sheet`s cell content.
    const json = JSON.stringify(parsingResult);
    const chunks = [];
    for (let i = 0; i < json.length; i += chunkSize) {
      const chunk = json.substring(i, i + 50000);
      chunks.push([url, chunk, '']);
    }

    chunks[0][2] = this._getEntityIds(parsingResult)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .join(',');

    const intertedCount = this.dbConnector.updateContentWithUrl(chunks);
    Logger.log(`${intertedCount} rows of content inserted.`);
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
      ids.forEach(id => entityIds.push(id));
    }

    return entityIds;
  }
}