async function run_etl() {
  const locker = LockService.getDocumentLock();
  if (locker.hasLock() || !locker.tryLock(1)) {
    throw Error('Locked.');
  }

  const fetchingService = new FetchingService();
  const pageParser = new GenshinHoneyHunterWorldParser.getPageParser();
  const dbConnector = new DbConnector();
  const contentManager = new ContentManager(dbConnector);
  const logManager = new LogManager(dbConnector);
  const etlService = new EtlService(fetchingService, pageParser, dbConnector, contentManager, logManager);

  etlService.updateAll();

  locker.releaseLock();
}

function disable_trigger() {
  Logger.log('Trigger started but nothing run.');
}