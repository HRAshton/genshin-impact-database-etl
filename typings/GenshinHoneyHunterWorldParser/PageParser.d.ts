/// <reference path="ParsingResultModel.d.ts" />

declare namespace GenshinHoneyHunterWorldParser {
  /**
   * Parses page.
   */
  class PageParser {
    /**
     * @param {string} html Page html.
     * @returns {ParsingResultModel} Parsing result.
     */
    parse(html: string): ParsingResultModel;
  }
}
