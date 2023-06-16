function validate(action, ids, locale, apiVersion) {
  const allowedLocales = Object.keys(Constants.supportedLangs());

  if (!allowedLocales.includes(locale)) {
    throw new Error(`Unexpected locale: '${locale}'. Only ${allowedLocales} allowed.`);
  }

  if (!ids || !ids.length) {
    throw new Error('Parameter should not be empty: ids.');
  }

  if (action !== 'getByIds') {
    throw new Error(`Unexpected action: '${action}'. Only 'getByIds' allowed.`);
  }

  if (apiVersion !== 'v1') {
    throw new Error(`Unexpected version: '${apiVersion}'. Only 'v1' allowed.`);
  }
}

/**
 * Gets data for entity.
 * @param {string?} event.parameter.action - Action. Options: 'getByIds' (default).
 * @param {string?} event.parameter.ids - Entity ids (joined by ',').
 * @param {string?} event.parameter.locale - Language.
 * @param {string?} event.parameter.api_version - Version of API. Options: v1.
 * @returns {GenshinHoneHunterWorldParser.ParsingResult} - Parsing result.
 */
const doGet = (event = {}) => {
  console.info('Request received.');

  const {
    // eslint-disable-next-line camelcase -- it's an API parameter names
    action = 'getByIds', ids, locale, api_version = 'v1',
  } = event.parameter;
  const filedIds = ids?.toLowerCase() || '';
  const fixedLocale = locale?.toUpperCase() || '';
  validate(action, ids, fixedLocale, api_version);
  console.log('Query parsed.');

  const langData = Helpers.getLangByCode(fixedLocale);
  const finalizationRepository = new FinalizationRepository(langData.finSheetId);
  console.log('Deps initialized.');

  let result;
  switch (action) {
    case 'getByIds': {
      const keys = filedIds.split(',').map((id) => `${fixedLocale}/${id}`);
      result = finalizationRepository.getByIds(keys);
      break;
    }

    default:
      throw new Error(`Unexpected action: '${action}'.`);
  }

  console.info('Response sending.');
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
};

// eslint-disable-next-line no-unused-vars -- for testing purposes
function _test() {
  doGet({ parameter: { ids: 'fam_book_family_1006,hs_40', locale: 'FR' } });
}
