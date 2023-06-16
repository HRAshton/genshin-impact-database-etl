class TransformService {
  /** @param { RawFilesRepository } rawFilesRepository
   *   @param { ParsedFilesRepository } parsedFilesRepository
   *   @param { FileSystemConnector } fileSystemConnector
   *   @param { PageParser } pageParser
   *   @param { NavBarParser } navBarParser
   *   @param { LogManager } logManager
   */
  constructor(
    rawFilesRepository,
    parsedFilesRepository,
    fileSystemConnector,
    pageParser,
    navBarParser,
    logManager,
  ) {
    this._rawFilesRepository = rawFilesRepository;
    this._parsedFilesRepository = parsedFilesRepository;
    this._fileSystemConnector = fileSystemConnector;
    this._pageParser = pageParser;
    this._logManager = logManager;
    this._navBarParser = navBarParser;

    this._config = {
      scriptTimeoutMs: Constants.scriptTimeoutMs(),
    };
  }

  transform() {
    const startTime = new Date();

    const existingHtmlsMeta = this._rawFilesRepository.getActualHtmlFiles();
    const existingJsonsMeta = this._parsedFilesRepository.getParsedHtmlFiles();
    console.info(`Found '${existingHtmlsMeta.length}' htmls, '${existingJsonsMeta.length}' jsons.`);

    const pagesToProcess = existingHtmlsMeta
      .filter((data) => data.status === 'OK'
        && !existingJsonsMeta.some((ex) => ex.fileId === data.fileId && ex.url === data.url));
    console.info(`Found '${pagesToProcess.length}' unprocessed pages.`);

    this._saveNavbarContent(pagesToProcess[0]);
    this._processPages(startTime, pagesToProcess);

    this._logManager.saveLog(startTime, TransformService.name);
  }

  /** @param { {fileId: string; modifiedAt: string; status: string} } pageToProcess */
  _saveNavbarContent(pageToProcess) {
    if (!pageToProcess) {
      return;
    }

    const { fileId, modifiedAt } = pageToProcess;
    console.log(`Parsing navbar items from '${fileId}'.`);

    console.log(`Reading '${fileId}'.`);
    const html = this._fileSystemConnector.readAllText(fileId);
    const parsingResult = this._navBarParser.parse(html);
    if (!parsingResult || !parsingResult.length) {
      console.warn('Unable to parse navbar links.');
      return;
    }

    const item = {
      Id: '_internal_navbar',
      Name: '_internal_navbar',
      Items: parsingResult
        .map((url) => url.split('/')[1])
        .map((id) => ({
          Id: id,
          Name: id,
        })),
    };

    const json = JSON.stringify(item);

    console.info(`Saving '_internal_navbar' (${fileId}).`);
    this._parsedFilesRepository.saveParsingResult('_internal_navbar', fileId, json, modifiedAt);
  }

  /** @param { Date } startTime
   *  @param { {fileId: string; modifiedAt: string; status: string}[] } pagesToProcess */
  _processPages(startTime, pagesToProcess) {
    for (let i = 0; i < pagesToProcess.length; i += 1) {
      if (this._isTimedOut(startTime)) {
        console.info('Break due to timeout.');
        break;
      }

      const { url, fileId, modifiedAt } = pagesToProcess[i];
      console.log(`Parsing '${fileId}' (${i + 1} / ${pagesToProcess.length}).`);

      const parsingResult = this._parse(fileId);
      if (!parsingResult.Id) {
        console.warn('Unable to parse file.');
      }

      const json = JSON.stringify(parsingResult);

      console.log(`Saving '${fileId}'.`);
      this._parsedFilesRepository.saveParsingResult(url, fileId, json, modifiedAt);
    }
  }

  /** @param { fileId } string
   *  @returns { object }
   */
  _parse(fileId) {
    try {
      console.log(`Reading '${fileId}'.`);
      const html = this._fileSystemConnector.readAllText(fileId);

      console.log(`Parsing '${fileId}'.`);
      const parsingResult = this._pageParser.parse(html);
      if (!parsingResult) {
        throw new Error('Empty result received.');
      }

      return parsingResult;
    } catch (e) {
      console.warn(`Error: ${e}`);

      return { EtlError: 'Unable to fetch or parse data.' };
    }
  }

  /** @param { Date } startTime */
  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}

globalRegister(TransformService);
