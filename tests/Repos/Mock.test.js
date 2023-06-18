// eslint-disable-next-line import/no-unresolved,@typescript-eslint/no-var-requires
const { ranges, initRowsCount, spreadsheetApp } = require('./SpreadsheetMock');

describe('mock validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('common', () => {
    it('should return null if spreadsheet id is not defined', () => {
      expect(spreadsheetApp.openById('some_id')).toBeNull();
    });

    it('should allow to check invocation count', () => {
      spreadsheetApp.openById('raw_sheet_id')
        .getSheetByName('main')
        .getRange('some_range')
        .setValues([['some_url', 'some_fileId', 'some_modifiedAt']]);

      expect(spreadsheetApp.openById).toHaveBeenCalledTimes(1);
      expect(spreadsheetApp.openById('raw_sheet_id')).not.toBeNull();
      expect(spreadsheetApp.openById).toHaveBeenCalledTimes(2);

      expect(spreadsheetApp.openById('raw_sheet_id').getSheetByName)
        .toHaveBeenCalledTimes(1);

      expect(spreadsheetApp.openById('raw_sheet_id').getSheetByName('main').getRange)
        .toHaveBeenCalledTimes(1);

      const setValueMock = spreadsheetApp.openById('raw_sheet_id')
        .getSheetByName('main')
        .getRange('some_range')
        .setValues;
      expect(setValueMock).toHaveBeenCalledTimes(1);
      expect(setValueMock).toHaveBeenCalledWith([['some_url', 'some_fileId', 'some_modifiedAt']]);
    });

    it('should return initial row count', () => {
      const lastRow = spreadsheetApp.openById('raw_sheet_id')
        .getSheetByName('main')
        .getLastRow();

      expect(lastRow).toEqual(initRowsCount);
    });
  });

  describe('raw sheet', () => {
    it('should return null if raw sheet name is not defined', () => {
      expect(spreadsheetApp.openById('raw_sheet_id').getSheetByName('some_name')).toBeNull();
    });

    it.each(Object.values(ranges.raw).map((args) => [args]))(
      'should return correct rows count for range %s of the raw sheet',
      (range) => {
        // noinspection JSCheckFunctionSignatures -- lint bug
        const rows = spreadsheetApp.openById('raw_sheet_id')
          .getSheetByName('main')
          .getRange(...range)
          .getValues();

        expect(rows).toHaveLength(initRowsCount);
      },
    );

    it('should throw if passed range is not defined in the raw sheet', () => {
      expect(
        () => spreadsheetApp.openById('raw_sheet_id')
          .getSheetByName('main')
          .getRange('some_range')
          .getValues(),
      ).toThrow('Unexpected arguments: some_range, undefined, undefined, undefined');
    });
  });

  describe('parsed sheet', () => {
    it('should return null if parsed sheet name is not defined', () => {
      expect(spreadsheetApp.openById('parsed_sheet_id').getSheetByName('some_name')).toBeNull();
    });

    it('should return correct rows count for the parsed sheet', () => {
      // noinspection JSCheckFunctionSignatures -- lint bug
      const rows = spreadsheetApp.openById('parsed_sheet_id')
        .getSheetByName('main')
        .getRange('A2:B')
        .getValues();

      expect(rows).toHaveLength(initRowsCount);
    });

    it('should return correct notes count for the parsed sheet', () => {
      // noinspection JSCheckFunctionSignatures -- lint bug
      const rows = spreadsheetApp.openById('parsed_sheet_id')
        .getSheetByName('main')
        .getRange('D2:D')
        .getNotes();

      expect(rows).toHaveLength(initRowsCount);
    });

    it('should throw if passed range is not defined in the parsed sheet for getValues', () => {
      expect(
        () => spreadsheetApp.openById('parsed_sheet_id')
          .getSheetByName('main')
          .getRange('some_range')
          .getValues(),
      ).toThrow('Unexpected arguments: some_range, undefined, undefined, undefined');
    });

    it('should throw if passed range is not defined in the parsed sheet for getNotes', () => {
      expect(
        () => spreadsheetApp.openById('parsed_sheet_id')
          .getSheetByName('main')
          .getRange('some_range')
          .getNotes(),
      ).toThrow('Unexpected arguments: some_range, undefined, undefined, undefined');
    });
  });

  describe('dashboard sheet', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return null if dashboard sheet name is not defined', () => {
      expect(spreadsheetApp.openById('dashboard_sheet_id').getSheetByName('some_name')).toBeNull();
    });
  });

  describe('finalization sheet', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return null if finalization sheet name is not defined', () => {
      expect(spreadsheetApp.openById('fin_sheet_id').getSheetByName('some_name')).toBeNull();
    });

    it('should return correct notes count for the finalization sheet', () => {
      // noinspection JSCheckFunctionSignatures -- lint bug
      const rows = spreadsheetApp.openById('fin_sheet_id')
        .getSheetByName('finSheet')
        .getRange(ranges.finalization.keys[0])
        .getValues();

      expect(rows).toHaveLength(initRowsCount);
    });

    it('should throw if passed range is not defined in the finalization sheet for getValues', () => {
      expect(
        () => spreadsheetApp.openById('fin_sheet_id')
          .getSheetByName('finSheet')
          .getRange('some_range')
          .getValues(),
      ).toThrow('Unexpected arguments: some_range, undefined, undefined, undefined');
    });
  });
});
