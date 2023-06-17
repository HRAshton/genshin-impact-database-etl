declare namespace GenshinHoneyHunterWorldParser {
  /**
   * Represents metadata of the page.
   */
  class MetadataModel {
    /** Date in ISO format. Parsed from <article:modified_time />. */
    ModifiedAt: string;

    /** Locale of the page. Parsed from <meta property="og:locale" />. */
    Locale: string;
  }
}
