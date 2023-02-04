/**
 * Gets data for entity.
 * @param {string} action - Action. Options: 'getByIds' (default).
 * @param {string} ids - Entity ids (joined by ',').
 * @param {string} locale - Language.
 * @returns {GenshinHoneHunterWorldParser.ParsingResult} - Parsing result.
 */
const doGet = (event = {}) => {
  Logger.log('Request received.');

  const allowedLocales = ['ru_RU', 'en_EN'];
  const { action = 'getByIds', ids, locale } = event.parameter;

  if (!allowedLocales.includes(locale)) {
    throw new Error(`Unexpected locale: '${locale}'. Only ${allowedLocales} allowed.`);
  }

  if (!ids || !ids.length) {
    throw new Error(`Parameter should not be empty: ids.`);
  }

  if (action !== 'getByIds') {
    throw new Error(`Unexpected action: '${action}'. Only 'getByIds' allowed.`);
  }

  Logger.log('Query parsed.')

  const dbConnector = new DbConnector();
  const contentManager = new ContentManager(dbConnector);
  Logger.log('Deps initialized.');

  let result;
  switch (action) {
    case 'getByIds':
      result = contentManager.getParsingResultsByIds(ids.split(','), locale);
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
  doGet({ parameter: { ids: 'fam_book_family_1006,fam_book_family_1005', locale: 'ru_RU' } });
}