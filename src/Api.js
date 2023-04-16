/**
 * Gets data for entity.
 * @param {string} action - Action. Options: 'getByIds' (default).
 * @param {string} ids - Entity ids (joined by ',').
 * @param {string} locale - Language.
 * @param {string} api_version - Version of API. Options: v1.
 * @returns {GenshinHoneHunterWorldParser.ParsingResult} - Parsing result.
 */
const doGet = (event = {}) => {
  console.info('Request received.');

  const { action = 'getByIds', ids, locale, api_version = 'v1' } = event.parameter;
  const filedIds = ids?.toLowerCase() || '';
  const fixedLocale = locale?.toUpperCase() || '';
  validate(action, ids, fixedLocale, api_version);
  console.log('Query parsed.');

  const langData = Helpers.getLangByCode(fixedLocale);
  const finalizationRepository = new FinalizationRepository(langData.finSheetId);
  console.log('Deps initialized.');

  let result;
  switch (action) {
    case 'getByIds':
      const keys = filedIds.split(',').map(id => fixedLocale + '/' + id);
      result = finalizationRepository.getByIds(keys);
      break;

    default:
      throw new Error(`Unexpected action: '${action}'.`);
  }

  console.info('Response sending.');
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
};

function validate(action, ids, locale, api_version) {
  const allowedLocales = Object.keys(Constants.supportedLangs());

  if (!allowedLocales.includes(locale)) {
    throw new Error(`Unexpected locale: '${locale}'. Only ${allowedLocales} allowed.`);
  }

  if (!ids || !ids.length) {
    throw new Error(`Parameter should not be empty: ids.`);
  }

  if (action !== 'getByIds') {
    throw new Error(`Unexpected action: '${action}'. Only 'getByIds' allowed.`);
  }

  if (api_version !== 'v1') {
    throw new Error(`Unexpected version: '${api_version}'. Only 'v1' allowed.`);
  }
}

function _test() {
  doGet({ parameter: { ids: 'fam_book_family_1006,hs_40', locale: 'FR' } });
}