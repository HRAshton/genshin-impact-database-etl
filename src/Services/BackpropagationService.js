function BackpropagationService_tests() {
  const langData = Helpers.getLang(new Date(), 'IT');
  console.info(`Backpropagation job started for lang '${langData.lang}'`);

  const fileSystemConnector = new FileSystemConnector();
  const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
  const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
  const logManager = new LogManager(fileSystemConnector);
  const backpropagationService = new BackpropagationService(langData.lang, rawFilesRepository, parsedFilesRepository, fileSystemConnector, logManager);

  backpropagationService.run();
}

class BackpropagationService {
  /** @param { RawFilesRepository } rawFilesRepository
  *   @param { FileSystemConnector } fileSystemConnector
  *   @param { LogManager } logManager
  */
  constructor(lang, rawFilesRepository, parsedFilesRepository, fileSystemConnector, logManager) {
    this._lang = lang;
    this._fileSystemConnector = fileSystemConnector;
    this._rawFilesRepository = rawFilesRepository;
    this._parsedFilesRepository = parsedFilesRepository;
    this._logManager = logManager;
  }

  run() {
    const startTime = new Date();
    this._registerUrls(startTime);
    this._logManager.saveLog(startTime, BackpropagationService.name);
  }

  /** @param { Date } startTime */
  _registerUrls(startTime) {
    const knownUrls = new Set(this._rawFilesRepository.getKnownUrls());
    console.log(`${knownUrls.size} known urls fetched.`);

    const jsons = this._parsedFilesRepository.getAllParsedJsons();
    console.log(`${jsons.length} jsons fetched.`);

    const urlsFromOtherLangs = this._getUrlsFromOtherLangs();
    const urlsFromJsons = this._getUrlsFromJsons(jsons);
    const urlsToAdd = [...urlsFromJsons, ...urlsFromOtherLangs]
      .filter((item, i, arr) => arr.indexOf(item) === i)
      .filter((url) => !knownUrls.has(url));
    console.log(`${urlsToAdd.length} new urls found.`);
    if (!urlsToAdd.length) {
      console.info('No new urls added.');
      return;
    }

    const createdAt = startTime.toISOString();
    const cells = urlsToAdd.map((url) => ({ url, createdAt }));

    this._rawFilesRepository.addUrls(cells);
    console.info(`${urlsToAdd.length} new urls added.`);
  }

  _getUrlsFromOtherLangs() {
    const urls = [];
    for (const lang of Object.keys(Constants.supportedLangs())) {
      const langData = Constants.supportedLangs()[lang];
      const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
      const langUrls = rawFilesRepository.getKnownUrls();
      const truncatedUrls = langUrls.map((url) => url.split('=')[0]);

      urls.push(...truncatedUrls);
      console.log(`Collected ${langUrls.length} urls from ${lang}.`);
    }

    const uniqueUrls = new Set(urls.map((url) => `${url}=${this._lang}`));

    return uniqueUrls;
  }

  /** @param { string[] } jsons
   *  @param { string } lang
   *  @returns { string[] }
   */
  _getUrlsFromJsons(jsons) {
    const idRegex = /^[0-9a-z_]+$/;

    const urls = new Set();
    for (let i = 0; i < jsons.length; i++) {
      if (i % 1000 === 0) {
        console.log(`Processing json ${i + 1} / ${jsons.length}...`);
      }

      const json = jsons[i];
      if (!json) {
        continue;
      }

      const item = JSON.parse(json);
      const entityIds = this._getEntityIds(item);
      const filteredIds = entityIds.filter((id) => id.match(idRegex)); // todo
      for (const id of filteredIds) {
        const url = `/${id}/?lang=${this._lang}`;

        urls.add(url);
      }
    }

    return urls;
  }

  /** @param { object } parsingResult
   *  @returns { string[] }
   */
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
