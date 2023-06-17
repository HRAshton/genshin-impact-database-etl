class Helpers {
  /** Finds row by text in the specified range.
   * @param { GoogleAppsScript.Spreadsheet.Range } range
   * @param { string } text
   * @returns { number | undefined }
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
   *  @param { Date } startTime
   *  @param { string? } [overrideLang]
   *  @returns { SupportedLangsEntry & { lang: string } } */
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

  /** @param { string } langCode
   *  @returns { SupportedLangsEntry } */
  static getLangByCode(langCode) {
    return Constants.supportedLangs()[langCode];
  }
}

globalRegister(Helpers);
