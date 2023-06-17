/// <reference path="NavBarParser.d.ts" />
/// <reference path="PageParser.d.ts" />

declare namespace GenshinHoneyHunterWorldParser {
  /**
   * Creates and gets new instance of NavbarParser.
   * @returns {NavBarParser}
   */
  function getNavbarParser(): NavBarParser;

  /**
   * Creates and gets new instance of PageParser.
   * @returns {PageParser}
   */
  function getPageParser(): PageParser;
}
