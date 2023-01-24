/**
 * Gets data for entity.
 * @param {string} action - Action. Options: 'getByIds' (default).
 * @param {string} id - Entity id.
 * @param {string} ids - Entity ids (joined by ',').
 * @param {string} lang - Language (RU by default).
 * @returns {GenshinHoneHunterWorldParser.ParsingResult} - Parsing result.
 */
const doGet = (event = {}) => {
  Logger.log('Request received.');

  const { action = 'getByIds', ids = null, lang = 'RU' } = event.parameter;
  if (lang !== 'RU') {
    throw new Error(`Unexpected 'id' (${ids}) or lang ('${lang}').`);
  }
  Logger.log('Query parsed.')

  const dbConnector = new DbConnector();
  const contentManager = new ContentManager(dbConnector);
  Logger.log('Deps initialized.');

  let result;
  switch (action) {
    case 'getByIds':
      result = contentManager.getParsingResultsByIds(ids.split(','), lang);
      break;

    default:
      throw new Error(`Unexpected action: '${action}'.`);
  }

  Logger.log('Response sending.');
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
};

function _test() {
  doGet({ parameter: { action: 'getByIds', ids: 'fam_book_family_1006' } });
}