declare namespace GenshinHoneyHunterWorldParser {
  /**
   * Parses navbar links from any page (until it has a navbar).
   */
  class NavBarParser {
    /**
     * Parses navbar.
     * @param {string} homePageHtml
     * @returns {string[]} Array of navbar links.
     *  */
    parse(homePageHtml: string): string[];
  }
}
