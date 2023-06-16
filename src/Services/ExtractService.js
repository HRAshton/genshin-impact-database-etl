async function ExtractService_tests() {
  try {
    const langData = Helpers.getLang(new Date(), 'DE');
    console.info(`Extract job started for lang '${langData.lang}'`);

    const fetchingService = new FetchingService();
    const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
    const fileSystemConnector = new FileSystemConnector();
    const logManager = new LogManager(fileSystemConnector);
    const extractService = new ExtractService(fetchingService, rawFilesRepository, fileSystemConnector, logManager);

    await extractService.extractAsync();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

class ExtractService {
  /** @param { FetchingService } fetchingService
   *  @param { RawFilesRepository } rawFilesRepository
   *  @param { FileSystemConnector } fileSystemConnector
   *  @param { LogManager } logManager
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

  async extractAsync() {
    const startTime = new Date();

    const allKnownPages = this._rawFilesRepository.getKnownPages();
    const pagesToFetch = this._sortAndFilterPagesByActuality(allKnownPages);
    console.log(`${pagesToFetch.length} unactual pages found.`);

    await this._extractUrlsAsync(pagesToFetch, startTime);

    this._logManager.saveLog(startTime, ExtractService.name);
  }

  /** @param   { {url: string, fileId: string, modifiedAt: string}[] } allKnownPages
   *  @returns { {url: string, fileId: string, modifiedAt: string}[] }
   */
  _sortAndFilterPagesByActuality(allKnownPages) {
    const cacheUnvalidatedDateTime = new Date(new Date().getTime() - this._config.urlReloadPeriodSecs * 1000).toISOString();

    const pagesToFetch = allKnownPages
      .filter((pair) => !pair.modifiedAt || pair.modifiedAt < cacheUnvalidatedDateTime)
      .sort((p1, p2) => p1.modifiedAt.localeCompare(p2.modifiedAt));

    return pagesToFetch;
  }

  /** @param { {url: string, fileId: string, modifiedAt: string}[] } allKnownPages
   *  @param { Date } startTime
   */
  async _extractUrlsAsync(pagesToFetch, startTime) {
    for (let i = 0; i < pagesToFetch.length; i++) {
      if (this._isTimedOut(startTime)) {
        console.info('Break due to timeout.');
        break;
      }

      const { url } = pagesToFetch[i];
      console.log(`Fetching ${url} (${i + 1} / ${pagesToFetch.length}).`);

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

  /** @param { string } url
   *  @returns { Promise<{html: string, status: string}> }
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
        status: e.toString(),
      };
    }
  }

  /** @param { string } url
   *  @param { string } html
   *  @returns { string } Id of existed or created file.
   */
  _saveFile(url, html) {
    if (!html) {
      console.warn('No html.');
    }

    const content = html ?? '';
    const fileName = `${url.replace(/[<>:"\/\\|?*]/g, '_')}.html`;

    return this._fileSystemConnector.createFile(fileName, content);
  }

  /** @param { Date } startTime */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}

globalRegister(ExtractService);
