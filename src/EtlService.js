BaseUrl = 'https://genshin.honeyhunterworld.com';
Langs = ['RU', 'EN'];
UrlReloadPeriodSecs = 7 * 24 * 60 * 60; // 7 days
ScriptTimeoutSecs = 4 * 60; // 4 minutes

class EtlService {
  constructor(fetchingService, pageParser, dbConnector, contentManager, logManager) {
    this.fetchingService = fetchingService;
    this.pageParser = pageParser;
    this.dbConnector = dbConnector;
    this.contentManager = contentManager;
    this.logManager = logManager;
  }

  async updateAll() {
    const startTime = new Date();

    let iteration = 0;
    let previousLoadingResult = true;
    while (previousLoadingResult) {
      if (this._isTimeoutReached(startTime)) {
        Logger.log('Break due to timeout.');
        break;
      }

      const allKnownUrls = await this._getAllKnownUrlsAsync();
      const urlsToFetch = this._filterUrlsByActuality(allKnownUrls);

      previousLoadingResult = await this._loadAcqDataAsync(urlsToFetch, startTime);

      Logger.log(`Iteration ${++iteration} finished.`);
    }

    this.logManager.saveLog(startTime);

    if (previousLoadingResult) {
      Logger.log('Job partially completed.');
    } else {
      Logger.log('Job fully completed.');
    }
  }

  async _getAllKnownUrlsAsync() {
    const knownUrls = [];

    for (const lang of Langs) {
      const navBarUrls = await this._fetchUrlsFromNavbarAsync(lang);

      const knownIds = this.contentManager.getKnownIds();
      const entitiesUrls = knownIds.map(id => `/${id}/?lang=${lang}`);

      knownUrls.push(...navBarUrls, ...entitiesUrls);
    }

    return knownUrls;
  }

  async _fetchUrlsFromNavbarAsync(lang) {
    const navBarFetcher = new GenshinHoneyHunterWorldParser.getNavbarParser();
    const homePage = await this.fetchingService.fetchAsync(`${BaseUrl}/?lang=${lang}`);
    const navBarUrls = navBarFetcher.parse(homePage);

    return navBarUrls;
  }

  _filterUrlsByActuality(urls) {
    const cacheUnvalidateDateTime = new Date(new Date().getTime() - UrlReloadPeriodSecs * 1000).toISOString();

    const urlsHistory = this.dbConnector.getUpdatesHistory();
    const actualUrls = urlsHistory
      .filter(hist => hist.updatedAt > cacheUnvalidateDateTime)
      .map(hist => hist.url);

    const urlsToFetch = urls.filter(url => !actualUrls.includes(url));

    return urlsToFetch;
  }

  async _loadAcqDataAsync(urlsToFetch, startTime) {
    if (urlsToFetch.length === 0) {
      return false;
    }

    for (const url of urlsToFetch) {
      if (this._isTimeoutReached(startTime)) {
        Logger.log('Break due to timeout.');
        break;
      }

      let parsingResult;
      try {
        Logger.log(`Parsing ${url} (${urlsToFetch.indexOf(url) + 1} / ${urlsToFetch.length}).`);
        const html = await this.fetchingService.fetchAsync(BaseUrl + url);
        parsingResult = this.pageParser.parse(html);
      } catch (e) {
        Logger.log('-' * 25);
        Logger.log('Error: ' + e);
        Logger.log('-' * 25);

        parsingResult = { 'EtlError': 'Unable to fetch or parse data.' };
      }

      Logger.log(`Saving ${url}.`);
      this.contentManager.updateParsingResult(url, parsingResult);
      this.dbConnector.updateUpdatesHistory(url);
    }

    return true;
  }

  _isTimeoutReached(startTime) {
    return (new Date() - startTime) > ScriptTimeoutSecs * 1000;
  }
}