async function ExtractService_tests() {
  try {
    const fetchingService = new FetchingService();
    const dbConnector = new DbConnector();
    const fileSystemConnector = new FileSystemConnector();
    const extractService = new ExtractService(fetchingService, dbConnector, fileSystemConnector);

    await extractService.extractAsync();
  } catch (ex) {
    Logger.log(ex);
    throw ex;
  }
}

class ExtractService {
  constructor(fetchingService, dbConnector, fileSystemConnector) {
    this._fetchingService = fetchingService;
    this._dbConnector = dbConnector;
    this._fileSystemConnector = fileSystemConnector;

    this._config = {
      baseUrl: 'https://genshin.honeyhunterworld.com',
      urlReloadPeriodSecs: 4 * 24 * 60 * 60, // 4 days
      scriptTimeoutMs: 3 * 60 * 1000,        // 3 minutes
    };
  }

  async extractAsync() {
    const startTime = new Date();

    const allKnownPages = this._dbConnector.getKnownPages();
    const pagesToFetch = this._sortAndFilterPagesByActuality(allKnownPages);

    await this._extractUrlsAsync(pagesToFetch, startTime);
  }

  /** @param {[string, string, string][]} allKnownPages
   * @returns {[string, string, string][]}
   */
  _sortAndFilterPagesByActuality(allKnownPages) {
    const cacheUnvalidatedDateTime =
      new Date(new Date().getTime() - this._config.urlReloadPeriodSecs * 1000).toISOString();

    const pagesToFetch = allKnownPages
      .filter(pair => !pair[2] || pair[2] < cacheUnvalidatedDateTime)
      .sort((p1, p2) => p1[2].localeCompare(p2[2]));

    return pagesToFetch;
  }

  async _extractUrlsAsync(pagesToFetch, startTime) {
    for (let i = 0; i < pagesToFetch.length; i++) {
      if (this._isTimedOut(startTime)) {
        Logger.log('Break due to timeout.');
        break;
      }

      let [url, fileId, _] = pagesToFetch[i];
      Logger.log(`Fetching ${url} (${i + 1} / ${pagesToFetch.length}).`);

      const { html, status } = await this._fetchHtml(url);

      fileId = this._saveFile(url, html, fileId);

      Logger.log('Registering file...');
      const modifiedAt = new Date().toISOString();
      this._dbConnector.saveExtractingResult(url, modifiedAt, status, fileId);

      Logger.log(`Saved ${url}.`);
    }
  }

  async _fetchHtml(url) {
    try {
      return {
        html: await this._fetchingService.fetchAsync(this._config.baseUrl + url),
        status: 'OK',
      };
    } catch (e) {
      Logger.log('-' * 25);
      Logger.log('Error: ' + e);
      Logger.log('-' * 25);

      return {
        html: '',
        status: e.toString(),
      };
    }
  }

  _saveFile(url, html, fileId) {
    if (!html) {
      Logger.log('No html. Unsaved.');
      return fileId;
    }

    if (!fileId) {
      const fileName = url.replace(/[<>:"\/\\|?*]/g, '_');
      Logger.log(`Creating file '${fileName}'...`);
      return this._fileSystemConnector.createFile(fileName, html);
    } else {
      Logger.log('Updating file...');
      this._fileSystemConnector.writeAllText(fileId, html);
      return fileId;
    }
  }

  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}