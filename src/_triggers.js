const BaseUrl = 'https://genshin.honeyhunterworld.com';
const Lang = 'RU';
const UrlReloadPeriodSecs = 3 * 24 * 60 * 60; // 7 days. todo: 1day
const ScriptTimeoutSecs = 4 * 60; // 2 minutes

async function run_etl() {
  const startTime = new Date();

  const fetchingService = new FetchingService();
  const pageParser = new GenshinHoneyHunterWorldParser.getPageParser();
  const dbConnector = new DbConnector();
  const contentManager = new ContentManager(dbConnector);

  let iteration = 0;
  let previousLoadingResult = true;
  while (previousLoadingResult) {
    if ((new Date() - startTime) > ScriptTimeoutSecs * 1000) {
      Logger.log('Break due to timeout.');
      break;
    }

    const allKnownUrls = await getAllKnownUrlsAsync(fetchingService, contentManager);
    const urlsToFetch = filterUrlsByActuality(allKnownUrls, dbConnector);

    previousLoadingResult = await loadAcqDataAsync(urlsToFetch, fetchingService, dbConnector, pageParser, contentManager, startTime);

    Logger.log(`Iteration ${++iteration} finished.`);
  }

  if (previousLoadingResult) {
    Logger.log('Job partially completed.');
  } else {
    Logger.log('Job fully completed.');
  }
}

async function getAllKnownUrlsAsync(fetchingService, contentManager) {
  const navBarUrls = await fetchUrlsFromNavbarAsync(fetchingService);

  const knownIds = contentManager.getKnownIds();
  const entitiesUrls = knownIds.map(id => `/${id}/?lang=${Lang}`);
  const knownUrls = [...navBarUrls, ...entitiesUrls];

  return knownUrls;
}

async function fetchUrlsFromNavbarAsync(fetchingService) {
  const navBarFetcher = new GenshinHoneyHunterWorldParser.getNavbarParser();
  const homePage = await fetchingService.fetchAsync(`${BaseUrl}/?lang=${Lang}`);
  const navBarUrls = navBarFetcher.parse(homePage);

  return navBarUrls;
}

function filterUrlsByActuality(urls, dbConnector) {
  const cacheUnvalidateDateTime = new Date(new Date().getTime() - UrlReloadPeriodSecs * 1000).toISOString();

  const urlsHistory = dbConnector.getUpdatesHistory();
  const actualUrls = urlsHistory
    .filter(hist => hist.updatedAt > cacheUnvalidateDateTime)
    .map(hist => hist.url);

  const urlsToFetch = urls.filter(url => !actualUrls.includes(url));

  return urlsToFetch;
}

async function loadAcqDataAsync(urlsToFetch, fetchingService, dbConnector, pageParser, contentManager, startTime) {
  if (urlsToFetch.length === 0) {
    return false;
  }

  for (const url of urlsToFetch) {
    if ((new Date() - startTime) > ScriptTimeoutSecs * 1000) {
      Logger.log('Break due to timeout.');
      break;
    }

    try {
      Logger.log(`Parsing ${url} (${urlsToFetch.indexOf(url) + 1} / ${urlsToFetch.length}).`);
      const html = await fetchingService.fetchAsync(BaseUrl + url);
      const parsingResult = pageParser.parse(html);

      Logger.log(`Saving ${url}.`);
      contentManager.updateParsingResult(url, parsingResult);
      dbConnector.updateUpdatesHistory(url);
    } catch (e) {
      Logger.log('-' * 25);
      Logger.log('Error: ' + e);
      Logger.log('-' * 25);

      dbConnector.updateUpdatesHistory(url, true);
    }
  }

  return true;
}

function disable_trigger() {
  Logger.log('Trigger started but nothing run.');
}
