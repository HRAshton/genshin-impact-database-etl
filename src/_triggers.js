function run_extract() {
  const locker = LockService.getDocumentLock();
  if (locker.hasLock() || !locker.tryLock(1)) {
    throw Error('Locked.');
  }

  try {
    const fetchingService = new FetchingService();
    const dbConnector = new DbConnector();
    const fileSystemConnector = new FileSystemConnector()
    const extractService = new ExtractService(fetchingService, dbConnector, fileSystemConnector);

    extractService.extractAsync();
  } catch (ex) {
    Logger.log(ex);
    throw ex;
  }

  locker.releaseLock();
}

function run_transform() {
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

function run_finalization() {
  const dbConnector = new DbConnector();
  const finLoader = new FinLoader(dbConnector);

  finLoader.load();
}

function run_backpropagation() {
  const dbConnector = new DbConnector();
  const fileSystemConnector = new FileSystemConnector();
  const backpropagationService = new BackpropagationService(dbConnector, fileSystemConnector);

  backpropagationService.registerUrls();
}

function disable_trigger() {
  Logger.log('Trigger started but nothing run.');
}