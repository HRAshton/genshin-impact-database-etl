function TransformService_tests() {
  try {
    const dbConnector = new DbConnector();
    const logManager = new LogManager(dbConnector);
    const fileSystemConnector = new FileSystemConnector();
    const pageParser = GenshinHoneyHunterWorldParser.getPageParser();
    const transformService = new TransformService(dbConnector, fileSystemConnector, pageParser, logManager);

    transformService.transform();
  } catch (ex) {
    Logger.log(ex);
    throw ex;
  }
}

class TransformService {
  constructor(dbConnector, fileSystemConnector, pageParser, logManager) {
    this._dbConnector = dbConnector;
    this._fileSystemConnector = fileSystemConnector;
    this._pageParser = pageParser;
    this._logManager = logManager;

    this._config = {
      scriptTimeoutMs: 4 * 60 * 1000,        // 4 minutes
    };
  }

  transform() {
    const startTime = new Date();

    const existingHtmlsMeta = this._dbConnector.getActualHtmlFiles();
    const existingJsonsMeta = this._dbConnector.getParsedHtmlFiles();
    Logger.log(`Found '${existingHtmlsMeta.length}' htmls, '${existingJsonsMeta.length}' jsons.`);

    const htmlsModifiedDates = Object.fromEntries(existingHtmlsMeta);
    const jsonsModifiedDates = Object.fromEntries(existingJsonsMeta);
    const pagesToProcess = existingHtmlsMeta
      .filter(data => data[2] === 'OK' && jsonsModifiedDates[data[0]] !== data[1]);
    Logger.log(`Found '${pagesToProcess.length}' unprocessed pages.`);

    for (let i = 0; i < pagesToProcess.length; i++) {
      if (this._isTimedOut(startTime)) {
        Logger.log('Break due to timeout.');
        break;
      }

      const fileId = pagesToProcess[i][0];
      Logger.log(`Parsing '${fileId}' (${i + 1} / ${pagesToProcess.length}).`);

      const parsingResult = this._parse(fileId);
      const json = JSON.stringify(parsingResult);

      Logger.log(`Saving '${fileId}'.`);
      this._dbConnector.saveParsingResult(fileId, json, htmlsModifiedDates[fileId]);
    }

    this._logManager.saveLog(startTime);
  }

  _parse(fileId) {
    try {
      Logger.log(`Reading '${fileId}'.`);
      const html = this._fileSystemConnector.readAllText(fileId);

      Logger.log(`Parsing '${fileId}'.`);
      const parsingResult = this._pageParser.parse(html);

      return parsingResult;
    } catch (e) {
      Logger.log('-' * 25);
      Logger.log('Error: ' + e);
      Logger.log('-' * 25);

      return { 'EtlError': 'Unable to fetch or parse data.' };
    }
  }

  _isTimedOut(startTime) {
    return (new Date() - startTime) > this._config.scriptTimeoutMs;
  }
}