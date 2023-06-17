/// <reference path="../typings.d.js" />

'use strict';

/** Service for backpropagation of URLs from parsing results to raw sheet. */
class BackpropagationService {
  /** Creates an instance of BackpropagationService.
   * @param { string } lang
   * @param { RawFilesRepository } rawFilesRepository
   * @param { ParsedFilesRepository } parsedFilesRepository
   * @param { FileSystemConnector } fileSystemConnector
   * @param { LogManager } logManager
   */
  constructor(lang, rawFilesRepository, parsedFilesRepository, fileSystemConnector, logManager) {
    this._lang = lang;
    this._fileSystemConnector = fileSystemConnector;
    this._rawFilesRepository = rawFilesRepository;
    this._parsedFilesRepository = parsedFilesRepository;
    this._logManager = logManager;
  }

  /** Registers all urls from all parsed jsons to raw sheet.
   * @returns { void }
   */
  run() {
    const startTime = new Date();
    this._registerUrls(startTime);
    this._logManager.saveLog(startTime, BackpropagationService.name);
  }

  /** Collects all urls from all parsed jsons and adds them to raw sheet.
   * @param { Date } startTime
   * @returns { void }
   * @private
   */
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

  /** Collects all urls from raw sheets.
   * TODO: Rename.
   * @returns { Set<string> }
   * @private
   */
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

  /** Creates a set of URLs from IDs of parsing results.
   * @param { string[] } jsons - Parsing results in JSON format.
   * @returns { Set<string> } - Set of URLs for the current language.
   * @private
   */
  _getUrlsFromJsons(jsons) {
    const idRegex = /^[0-9a-z_]+$/;

    const urls = new Set();
    for (let i = 0; i < jsons.length; i += 1) {
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

  /** Recursively collects all IDs from parsing results.
   * @param { GenshinHoneyHunterWorldParser.ParsingResultModel } parsingResult
   * @returns { string[] }
   * @private
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

globalRegister(BackpropagationService);
