require('../../src/Helpers/GlobalRegister');
require('../../src/Helpers/Assert');
require('../../src/Repos/FinalizationRepository');

// eslint-disable-next-line import/no-unresolved,@typescript-eslint/no-var-requires
const { spreadsheetApp } = require('./SpreadsheetMock');
// noinspection JSValidateTypes
global.SpreadsheetApp = spreadsheetApp;
global.Helpers = {
  getRowByText: jest.fn(),
};

describe('FinalizationRepository', () => {
  describe('constructor', () => {
    it('should throw if spreadsheet id is not defined', () => {
      expect(() => new FinalizationRepository('fin_sheet_id')).not.toThrow();
    });

    it('should throw if sheet is not found', () => {
      expect(() => new FinalizationRepository('some_id')).toThrow();
    });
  });

  describe('saveFinalizationData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save finalization data', () => {
      const finalizationData = [
        { key: 'some_id1', value: 'some_value1' },
        { key: 'some_id2', value: 'some_value2' },
        { key: 'some_id3', value: 'some_value3' },
        { key: 'some_id4', value: 'some_value4' },
        { key: 'some_id5', value: 'some_value5' },
        { key: 'some_id6', value: 'some_value6' },
      ];

      const repo = new FinalizationRepository('fin_sheet_id');
      repo.saveFinalizationData(finalizationData);

      const { setValues, setNotes } = repo._sheet.getRange(1, 1, finalizationData.length, 1);

      expect(setValues).toHaveBeenCalledTimes(1);
      expect(setValues).toHaveBeenCalledWith(finalizationData.map((row) => [row.key]));

      expect(setNotes).toHaveBeenCalledTimes(1);
      expect(setNotes).toHaveBeenCalledWith(finalizationData.map((row) => [row.value]));
    });

    it('should throw if finalization data is too short', () => {
      const finalizationData = [
        { key: 'some_id1', value: 'some_value1' },
        { key: 'some_id2', value: 'some_value2' },
      ];

      const repo = new FinalizationRepository('fin_sheet_id');
      expect(() => repo.saveFinalizationData(finalizationData)).toThrow();
    });

    it('should throw if finalization some key is not defined', () => {
      const finalizationData = [
        { key: 'some_id1', value: 'some_value1' },
        { key: '', value: 'some_value2' },
      ];

      const repo = new FinalizationRepository('fin_sheet_id');
      expect(() => repo.saveFinalizationData(finalizationData)).toThrow();
    });

    it('should throw if finalization some values is not defined', () => {
      const finalizationData = [
        { key: 'some_id1', value: 'some_value1' },
        { key: 'some_id2', value: '' },
      ];

      const repo = new FinalizationRepository('fin_sheet_id');
      expect(() => repo.saveFinalizationData(finalizationData)).toThrow();
    });
  });

  describe('getAllKeys', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return keys', () => {
      const repo = new FinalizationRepository('fin_sheet_id');
      const result = repo.getAllKeys();

      expect(result).toEqual(['some_id1', 'some_id2', 'some_id3', 'some_id4']);
    });
  });

  describe('getByIds', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return items by ids', () => {
      global.Helpers.getRowByText.mockReturnValueOnce(2);

      const repo = new FinalizationRepository('fin_sheet_id');
      const result = repo.getByIds(['some_id']);

      expect(result).toEqual([
        { Id: 'some_id', Name: 'some_name' },
      ]);
    });

    it('should return empty array if ids is empty', () => {
      const repo = new FinalizationRepository('fin_sheet_id');
      const result = repo.getByIds([]);

      expect(result).toEqual([]);
    });

    it('should return empty array if ids not found', () => {
      global.Helpers.getRowByText.mockReturnValue(undefined);

      const repo = new FinalizationRepository('fin_sheet_id');
      const result = repo.getByIds(['some_id']);

      expect(result).toEqual([]);
    });
  });
});
