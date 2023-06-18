require('../../src/Helpers/GlobalRegister');
require('../../src/Repos/ParsedFilesRepository');

// eslint-disable-next-line import/no-unresolved,@typescript-eslint/no-var-requires
const { spreadsheetApp } = require('./SpreadsheetMock');
// noinspection JSValidateTypes
global.SpreadsheetApp = spreadsheetApp;
// noinspection JSValidateTypes
global.LockService = {
  getScriptLock: jest.fn(() => ({
    waitLock: jest.fn(),
    releaseLock: jest.fn(),
  })),
};

global.Constants = {
  scriptTimeoutMs: jest.fn(() => 1000),
};

const getRowByTextConstantResult = 2;
global.Helpers = {
  getRowByText:
    jest.fn((_, text) => (text !== 'unknown_text' && getRowByTextConstantResult) || null),
};

describe('ParsedFilesRepository', () => {
  describe('constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be instantiable', () => {
      expect(() => new ParsedFilesRepository('parsed_sheet_id')).not.toThrow();
    });

    it('should throw if sheet is not found', () => {
      expect(() => new ParsedFilesRepository('any_other_sheet_id')).toThrow();
    });
  });

  describe('getParsedHtmlFiles', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return parsed files', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      const parsedFiles = parsedFilesRepository.getParsedHtmlFiles();

      expect(parsedFiles).toEqual([
        { url: 'some_url', fileId: 'some_fileId' },
        { url: 'some_url2', fileId: 'some_fileId2' },
        { url: 'some_url3', fileId: 'some_fileId3' },
      ]);
    });

    it('should not return empty rows', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      const parsedFiles = parsedFilesRepository.getParsedHtmlFiles();

      expect(parsedFiles).not.toContainEqual({ url: '', fileId: '' });
    });

    it('should release lock', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      parsedFilesRepository.getParsedHtmlFiles();

      expect(parsedFilesRepository._lock.waitLock).toBeCalledTimes(1);
      expect(parsedFilesRepository._lock.releaseLock).toBeCalledTimes(1);
    });
  });

  describe('saveParsingResult', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save parsing result to existing row if url is already present', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      parsedFilesRepository.saveParsingResult(
        'known_url',
        'some_fileId',
        'some_json',
        'some_modifiedAt',
      );

      expect(parsedFilesRepository._sheet.getRange(2, 2, 1, 2).setValues).toBeCalledWith([
        ['some_fileId', 'some_modifiedAt'],
      ]);
    });

    it('should save parsing result to new row if url is not present', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');
      const initialLastRow = parsedFilesRepository._sheet.getLastRow();

      parsedFilesRepository.saveParsingResult(
        'unknown_text',
        'some_fileId',
        'some_json',
        'some_modifiedAt',
      );

      expect(parsedFilesRepository._sheet.insertRowsAfter).toBeCalledWith(initialLastRow, 1);
      expect(parsedFilesRepository._sheet.getRange(initialLastRow + 1, 1, 1, 4).setValues)
        .toBeCalledWith([
          ['unknown_text', 'some_fileId', 'some_modifiedAt', 'content'],
        ]);
    });

    it('should release lock', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      parsedFilesRepository.saveParsingResult(
        'known_url',
        'some_fileId',
        'some_json',
        'some_modifiedAt',
      );

      expect(parsedFilesRepository._lock.waitLock).toBeCalledTimes(1);
      expect(parsedFilesRepository._lock.releaseLock).toBeCalledTimes(1);
    });
  });

  describe('getAllParsedJsons', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return parsed jsons', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      const parsedJsons = parsedFilesRepository.getAllParsedJsons();

      expect(parsedJsons).toEqual([
        'some_note',
        'some_note2',
        'some_note3',
      ]);
    });

    it('should not return empty rows', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      const parsedJsons = parsedFilesRepository.getAllParsedJsons();

      expect(parsedJsons).not.toContainEqual('');
    });

    it('should release lock', () => {
      const parsedFilesRepository = new ParsedFilesRepository('parsed_sheet_id');

      parsedFilesRepository.getAllParsedJsons();

      expect(parsedFilesRepository._lock.waitLock).toBeCalledTimes(1);
      expect(parsedFilesRepository._lock.releaseLock).toBeCalledTimes(1);
    });
  });
});
