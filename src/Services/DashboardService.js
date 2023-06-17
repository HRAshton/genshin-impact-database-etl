/// <reference path="../typings.d.js" />

'use strict';

/** Service for collecting and saving data for the dashboard. */
// TODO: Add underscore to private methods.
class DashboardService {
  /** Creates an instance of DashboardService. */
  constructor() {
    this._config = {
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  /** Collects and saves data for the dashboard.
   * @returns { void }
   */
  run() {
    const startTime = new Date();
    const data = this.fetchData(startTime);
    console.log(data);
    if (this._isTimedOut(startTime)) {
      console.error('Timeout.');
      return;
    }

    if (!data) {
      console.error('Data is undefined.');
      return;
    }

    this._sheet = new DashboardRepository('15naKUcGFb6XsmGx-0MLP5C4UVqgEMudjq4iFHkKlGDw');
    this._sheet.saveData(data);
    // this._sheet.moveStats();
  }

  /** Collects data for the dashboard.
   * @param { Date } startTime
   * @returns { DashboardStatisticsEntry[] | undefined }
   * @private
   */
  fetchData(startTime) {
    const currentLang = Helpers.getLang(new Date()).lang;
    const allStats = [];
    for (const [langCode, langData] of Object.entries(Constants.supportedLangs())) {
      if (this._isTimedOut(startTime)) {
        console.error('Timeout.');
        return undefined;
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

  /** Collects data about the raw sheets.
   * @param { string } sheetId - The ID of the raw repository sheet.
   * @return { DashboardExtractStatisticsEntry }
   * @private
   */
  getExtractData(sheetId) {
    const repo = new RawFilesRepository(sheetId);
    const allData = repo.getKnownPages();
    const sortedData = allData.sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt));
    const filteredData = sortedData.filter((x) => !!x.modifiedAt);

    const cacheUnvalidatedDateSecs = new Date().getTime() - Constants.urlReloadPeriodSecs() * 1000;
    const cacheUnvalidatedDateTime = new Date(cacheUnvalidatedDateSecs).toISOString();

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

  /** Collects data about the parsed sheets.
   * @param { string } sheetId - The ID of the parsed repository sheet.
   * @return { DashboardTransformStatisticsEntry }
   * @private
   */
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

  /** Collects data about the finalization sheets.
   * @param { string } sheetId
   * @returns { DashboardFinalizationStatisticsEntry }
   * @private
   */
  getFinalizationData(sheetId) {
    const repo = new FinalizationRepository(sheetId);
    const allData = repo.getAllKeys().length;
    return {
      total: allData,
    };
  }

  /** Checks if the script is timed out.
   * @param { Date } startTime
   * @returns { boolean }
   * @private
   */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}

globalRegister(DashboardService);
