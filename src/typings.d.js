/// <reference types="../typings/GenshinHoneyHunterWorldParser/index.d.ts" />

/**
 @typedef {{
   EtlError: string;
 }} ParsingError

 @typedef {{
   url: string;
   createdAt: string;
 }} NewRawHtmlMetaEntry

 @typedef {{
   url: string;
   fileId: string;
   modifiedAt: string;
 }} RawHtmlMetaEntry

 @typedef {{
   url: string;
   fileId: string;
   modifiedAt: string;
   status: string;
 }} RawHtmlMetaWithStatus

 @typedef {{
   url: string;
   fileId: string;
 }} ParsedFileMeta

 @typedef {{
   rawSheetId: string;
   parsedSheetId: string;
   finSheetId: string;
 }} SupportedLangsEntry

 @typedef { Record<string, SupportedLangsEntry> } SupportedLangs

 @typedef {{
   langCode: string;
   isCurrent: boolean;
   extractData: DashboardExtractStatisticsEntry;
   transformData: DashboardTransformStatisticsEntry;
   finalizationData: DashboardFinalizationStatisticsEntry;
 }} DashboardStatisticsEntry

 @typedef {{
    files: number;
    empty: number;
    outdated: number;
    actual: number;
    oldest: Date;
    newest: Date;
    median: Date;
  }} DashboardExtractStatisticsEntry

 @typedef {{
   total: number;
   successful: number;
   unsuccessful: number;
  }} DashboardTransformStatisticsEntry

 @typedef {{
   total: number;
  }} DashboardFinalizationStatisticsEntry

 @typedef {{
   Id: string;
   Name: string;
   Main: Record<string, string | number | boolean> | null;
   Metadata: {
     ModifiedAt: string;
     Locale: string;
   };
   [key: string]: any;
  }} FinalizedEntry

 @typedef {{
   Id: string;
   Name: string;
   Items: {
      Id: string;
      Name: string;
   }[];
  }} ParsedNavbarModel

 @typedef { { parameter: ApiRequestParameters }} ApiRequestModel

 @typedef {{
   action?: string;
   ids?: string;
   locale?: string;
   api_version?: string;
  }} ApiRequestParameters
 */
