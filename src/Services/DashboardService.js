function DashboardService_tests() {
  try {
    const dashboardService = new DashboardService();
    dashboardService.run();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

class DashboardService {
  /** @param { FetchingService } fetchingService
   *  @param { RawFilesRepository } rawFilesRepository
   *  @param { FileSystemConnector } fileSystemConnector
   *  @param { LogManager } logManager
   */
  constructor() {
    this._config = {
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  run() {
    const startTime = new Date();
    const data = this.fetchData(startTime);
    console.log(data);
    if (this._isTimedOut(startTime)) {
      console.error('Timeout.');
      return;
    }

    this._sheet = new DashboardRepository('15naKUcGFb6XsmGx-0MLP5C4UVqgEMudjq4iFHkKlGDw');
    this._sheet.saveData(data);
    // this._sheet.moveStats();
  }

  fetchData(startTime) {
    const currentLang = Helpers.getLang(new Date()).lang;
    const allStats = [];
    for (const [langCode, langData] of Object.entries(Constants.supportedLangs())) {
      if (this._isTimedOut(startTime)) {
        console.error('Timeout.');
        return;
      }

      const extractData = this.getExtractData(langData.rawSheetId);
      const transformData = this.getTransformData(langData.parsedSheetId);
      const finalizationData = this.getFinalizationData(langData.finSheetId);

      allStats.push({
        langCode,
        isCurrent: currentLang === langCode,
        extractData,
        transformData,
        finalizationData,
      });

      console.info(`Data for ${langCode} collected.`);
    }

    return allStats;
  }

  getExtractData(sheetId) {
    const repo = new RawFilesRepository(sheetId);
    const allData = repo.getKnownPages();
    const sortedData = allData.sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt));
    const filteredData = sortedData.filter((x) => !!x.modifiedAt);

    const cacheUnvalidatedDateTime = new Date(new Date().getTime() - Constants.urlReloadPeriodSecs() * 1000).toISOString();

    return {
      files: allData.length,
      empty: allData.filter((x) => !x.modifiedAt).length,
      outdated: filteredData.filter((x) => x.modifiedAt < cacheUnvalidatedDateTime).length,
      actual: filteredData.filter((x) => x.modifiedAt >= cacheUnvalidatedDateTime).length,
      oldest: new Date(filteredData[0].modifiedAt),
      newest: new Date(filteredData[filteredData.length - 1].modifiedAt),
      median: new Date(filteredData[Math.round(filteredData.length / 2)].modifiedAt),
    };
  }

  getTransformData(sheetId) {
    const repo = new ParsedFilesRepository(sheetId);
    const total = repo.getParsedHtmlFiles().length;
    const successful = repo.getAllParsedJsons().filter((json) => json.includes('"Id":')).length;
    const unsuccessful = total - successful;

    return {
      total,
      successful,
      unsuccessful,
    };
  }

  getFinalizationData(sheetId) {
    const repo = new FinalizationRepository(sheetId);
    const allData = repo.getAllKeys().length;
    return {
      total: allData,
    };
  }

  /** @param { Date } startTime */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}
