/// <reference path="NamedEntityModelBase.d.ts" />
/// <reference path="TableModel.d.ts" />
/// <reference path="MetadataModel.d.ts" />

declare namespace GenshinHoneyHunterWorldParser {
  /**
   * Represents parsing result.
   */
  class ParsingResultModel extends NamedEntityModelBase {
    /** Main section. Can be null if the page doesn't have a main section. */
    Main: Record<string, string | number | boolean> | null;

    /** Tables of the page. */
    Tables: TableModel[];

    /** Metadata of the page. */
    Metadata: MetadataModel;
  }
}
