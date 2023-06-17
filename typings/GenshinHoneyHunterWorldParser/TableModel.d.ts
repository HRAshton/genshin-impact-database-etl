/// <reference path="NamedEntityModelBase.d.ts" />
/// <reference path="SectionModel.d.ts" />

declare namespace GenshinHoneyHunterWorldParser {
  type TableCellContent = object | string | number | boolean | null | undefined;

  class TableModel extends NamedEntityModelBase {
    /** Headers of the table. */
    Headers: string[];

    /** Rows of the table. Can contain any data represented on the page. */
    Rows: TableCellContent[][];

    /** Path to the section. Contains sections from the root to the table. */
    Path: SectionModel[];
  }
}
