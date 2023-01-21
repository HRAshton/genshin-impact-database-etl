/**
 * Gets data for entity.
 * @param {string} action - Action. Options: 'getByIds' (default).
 * @param {string} id - Entity id.
 * @param {string} ids - Entity ids (joined by ',').
 * @param {string} lang - Language (RU by default).
 * @returns {GenshinHoneHunperWorldParser.ParsingResult} - Parsing result.
 */
const doGet = (event = {}) => {
  Logger.log('Request received.');

  const { action = 'getByIds', id = null, ids = null, lang = 'RU' } = event.parameter;
  if (lang !== 'RU') {
    throw new Error(`Unexpected 'id' (${id}) or lang ('${lang}').`);
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
  doGet({ parameter: { action: 'getByIds', ids: 'hs_40' } });
}