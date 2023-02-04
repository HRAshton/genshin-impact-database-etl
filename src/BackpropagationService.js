function BackpropagationService_tests() {
  const dbConnector = new DbConnector();
  const fileSystemConnector = new FileSystemConnector();
  const backpropagationService = new BackpropagationService(dbConnector, fileSystemConnector);

  backpropagationService.registerUrls();
}

class BackpropagationService {
  constructor(dbConnector, fileSystemConnector) {
    this._dbConnector = dbConnector;
    this._fileSystemConnector = fileSystemConnector;
  }

  registerUrls() {
    const jsons = this._dbConnector.getAllRawJsons();
    Logger.log(`${jsons.length} jsons fetched.`);

    const urlsToAdd = this._getNewUrls(jsons);
    Logger.log(`${urlsToAdd.size} new urls found.`);
    if (urlsToAdd.size === 0) {
      Logger.log(`No new urls added.`);
      return;
    }

    const createdAt = new Date().toISOString();
    const cells = Array.from(urlsToAdd)
      .map(url => [url, '', '', '', createdAt]);

    this._dbConnector.addUrls(cells);
    Logger.log(`${urlsToAdd.size} new urls added.`);
  }

  _getNewUrls(jsons) {
    const knownUrls = new Set(this._dbConnector.getKnownUrls());
    const urlsToAdd = new Set();
    for (let i = 0; i < jsons.length; i++) {
      if (i % 1000 === 0) {
        Logger.log(`Processing json ${i + 1} / ${jsons.length}...`);
      }

      const json = jsons[i][0];
      if (!json) {
        continue;
      }

      const item = JSON.parse(json);
      const entityIds = this._getEntityIds(item);
      for (const id of entityIds) {
        for (const lang of Constants.langs()) {
          const url = `/${id}/?lang=${lang}`;

          if (knownUrls.has(url) || urlsToAdd.has(url)) {
            continue;
          }

          urlsToAdd.add(url);
        }
      }
    }

    return urlsToAdd;
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
}