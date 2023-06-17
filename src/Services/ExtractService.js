/// <reference path="../typings.d.js" />

'use strict';

/** Fetches html files, saves them to the Google Drive and updates the raw files repository. */
class ExtractService {
  /** Creates an instance of ExtractService.
   * @param { FetchingService } fetchingService
   * @param { RawFilesRepository } rawFilesRepository
   * @param { FileSystemConnector } fileSystemConnector
   * @param { LogManager } logManager
   */
  constructor(fetchingService, rawFilesRepository, fileSystemConnector, logManager) {
    this._fetchingService = fetchingService;
    this._rawFilesRepository = rawFilesRepository;
    this._fileSystemConnector = fileSystemConnector;
    this._logManager = logManager;

    this._config = {
      baseUrl: Constants.baseUrl(),
      urlReloadPeriodSecs: Constants.urlReloadPeriodSecs(),
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  /** Starts the process of fetching html files.
   * @returns { Promise<void> }
   */
  async extractAsync() {
    const startTime = new Date();

    const allKnownPages = this._rawFilesRepository.getKnownPages();
    const pagesToFetch = this._sortAndFilterPagesByActuality(allKnownPages);
    console.log(`${pagesToFetch.length} unactual pages found.`);

    await this._extractUrlsAsync(pagesToFetch, startTime);

    this._logManager.saveLog(startTime, ExtractService.name);
  }

  /** Sorts and filters pages by actuality.
   * Urls that were modified less than urlReloadPeriodSecs ago are not fetched.
   * Outdated urls are fetched in order of their modification date (most outdated first).
   * @param { RawHtmlMetaEntry[] } allKnownPages
   * @returns { RawHtmlMetaEntry[] }
   * @private
   */
  _sortAndFilterPagesByActuality(allKnownPages) {
    const cacheUnvalidatedDateMs = new Date().getTime() - this._config.urlReloadPeriodSecs * 1000;
    const cacheUnvalidatedDateTime = new Date(cacheUnvalidatedDateMs).toISOString();

    const pagesToFetch = allKnownPages
      .filter((pair) => !pair.modifiedAt || pair.modifiedAt < cacheUnvalidatedDateTime)
      .sort((p1, p2) => p1.modifiedAt.localeCompare(p2.modifiedAt));

    return pagesToFetch;
  }

  /** Fetches a single html file, saves it to the Google Drive and updates the raw files repository.
   * @param { RawHtmlMetaEntry[] } pagesToFetch
   * @param { Date } startTime
   * @private
   */
  async _extractUrlsAsync(pagesToFetch, startTime) {
    for (let i = 0; i < pagesToFetch.length; i += 1) {
      if (this._isTimedOut(startTime)) {
        console.info('Break due to timeout.');
        break;
      }

      const { url } = pagesToFetch[i];
      console.log(`Fetching ${url} (${i + 1} / ${pagesToFetch.length}).`);

      // eslint-disable-next-line no-await-in-loop -- pages should be fetched one by one by design
      const { html, status } = await this._fetchHtmlAsync(url);
      if (status.includes('Service invoked too many times for one day: urlfetch')) {
        console.info('Break due to quota.');
        break;
      }

      const newFileId = this._saveFile(url, html);
      if (!newFileId) {
        console.warn('No fileId. Skipped.');
        continue;
      }

      console.log('Registering file...');
      const modifiedAt = new Date().toISOString();
      this._rawFilesRepository.saveExtractingResult(url, modifiedAt, status, newFileId);

      console.log(`Saved ${url}.`);
    }
  }

  /** Fetches a single html file.
   * @param { string } url - Url to fetch.
   * @returns { Promise<{html: string, status: string}> }
   * @private
   */
  async _fetchHtmlAsync(url) {
    try {
      return {
        html: await this._fetchingService.fetchAsync(this._config.baseUrl + url),
        status: 'OK',
      };
    } catch (e) {
      console.warn(`Error: ${e}`);

      return {
        html: '',
        status: `${e}`,
      };
    }
  }

  /** Saves html to the Google Drive.
   * @param { string } url
   * @param { string } html
   * @returns { string } Id of existed or created file.
   * @private
   */
  _saveFile(url, html) {
    if (!html) {
      console.warn('No html.');
    }

    const content = html ?? '';
    const fileName = `${url.replace(/[<>:"/\\|?*]/g, '_')}.html`;

    return this._fileSystemConnector.createFile(fileName, content);
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

globalRegister(ExtractService);
