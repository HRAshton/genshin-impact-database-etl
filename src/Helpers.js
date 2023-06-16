class Helpers {
  /** @param { SpreadsheetApp.Range } range
   *  @param { string } text
   */
  static getRowByText(range, text) {
    const textFinder = range
      .createTextFinder(text)
      .matchCase(true)
      .matchEntireCell(true);
    const match = textFinder.findNext();
    const row = match?.getRow();

    return row;
  }

  /** Gets language to process by time.
   *  @param { Date } startTime.
   *  @param { string } overrideLang.
   *  @returns { {lang: string, rawSheetId: string, parsedSheetId: string, finSheetId: string} } */
  static getLang(startTime, overrideLang) {
    const rotationPeriod = Constants.rotationPeriodMinutes();
    const absDateMinutes = startTime.getMinutes() + (startTime.getHours() * 60);
    const absPeriod = Math.trunc(absDateMinutes / rotationPeriod);

    const langs = Object.keys(Constants.supportedLangs());
    const periodIndex = overrideLang
      ? langs.indexOf(overrideLang)
      : absPeriod % langs.length;
    const lang = langs[periodIndex];

    return { lang, ...Constants.supportedLangs()[lang] };
  }

  /** @param { string } langCode.
   *  @returns { {lang: string, rawSheetId: string, parsedSheetId: string, finSheetId: string} } */
  static getLangByCode(langCode) {
    return Constants.supportedLangs()[langCode];
  }

  /** @template T
   *  @param { () => T } action
   *  @param { number } times
   *  @returns T
   */
  static repeat(action, times) {
    for (let retry = 1; retry <= times; retry++) {
      try {
        return action();
      } catch (ex) {
        if (retry === times) {
          throw ex;
        }

        console.warn({ text: 'Repeat exception', exception: ex });
      }
    }
  }
}
