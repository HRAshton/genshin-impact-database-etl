async function run_extract() {
  try {
    const langData = Helpers.getLang(new Date());
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

async function run_extract_ru() {
  try {
    const langData = Helpers.getLang(new Date(), 'RU');
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

function run_transform_ru() {
  const langData = Helpers.getLang(new Date(), 'RU');
  console.info(`Transform job started for lang '${langData.lang}'`);

  try {
    const fileSystemConnector = new FileSystemConnector();
    const logManager = new LogManager(fileSystemConnector);
    const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
    const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
    const pageParser = GenshinHoneyHunterWorldParser.getPageParser();
    const navBarParser = GenshinHoneyHunterWorldParser.getNavbarParser();
    const transformService = new TransformService(rawFilesRepository, parsedFilesRepository, fileSystemConnector, pageParser, navBarParser, logManager);

    transformService.transform();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

function run_transform() {
  const langData = Helpers.getLang(new Date());
  console.info(`Transform job started for lang '${langData.lang}'`);

  try {
    const fileSystemConnector = new FileSystemConnector();
    const logManager = new LogManager(fileSystemConnector);
    const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
    const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
    const pageParser = GenshinHoneyHunterWorldParser.getPageParser();
    const navBarParser = GenshinHoneyHunterWorldParser.getNavbarParser();
    const transformService = new TransformService(rawFilesRepository, parsedFilesRepository, fileSystemConnector, pageParser, navBarParser, logManager);

    transformService.transform();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

function run_finalization() {
  const langData = Helpers.getLang(new Date());
  console.info(`Finalization job started for lang '${langData.lang}'`);

  const fileSystemConnector = new FileSystemConnector();
  const logManager = new LogManager(fileSystemConnector);
  const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
  const finalizationRepository = new FinalizationRepository(langData.finSheetId);
  const finalizationService = new FinalizationService(langData.lang, parsedFilesRepository, finalizationRepository, logManager);

  finalizationService.run();
}

function run_backpropagation() {
  const langData = Helpers.getLang(new Date());
  console.info(`Backpropagation job started for lang '${langData.lang}'`);

  const fileSystemConnector = new FileSystemConnector();
  const rawFilesRepository = new RawFilesRepository(langData.rawSheetId);
  const parsedFilesRepository = new ParsedFilesRepository(langData.parsedSheetId);
  const logManager = new LogManager(fileSystemConnector);
  const backpropagationService = new BackpropagationService(langData.lang, rawFilesRepository, parsedFilesRepository, fileSystemConnector, logManager);

  backpropagationService.run();
}

function run_maintenance() {
  const fileSystemConnector = new FileSystemConnector();
  const logManager = new LogManager(fileSystemConnector);
  const maintenanceService = new MaintenanceService(fileSystemConnector, logManager);

  maintenanceService.run();
}

function run_maintenance_clear_trashbin() {
  const fileSystemConnector = new FileSystemConnector();
  const logManager = new LogManager(fileSystemConnector);
  const maintenanceService = new MaintenanceService(fileSystemConnector, logManager);

  maintenanceService.clearTrashBin();
}

function run_dashboard() {
  try {
    const dashboardService = new DashboardService();
    dashboardService.run();
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

function disable_trigger() {
  console.info('Trigger started but nothing run.');
}
