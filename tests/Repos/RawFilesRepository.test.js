require('../../src/Helpers/GlobalRegister');
require('../../src/Repos/RawFilesRepository');
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/no-var-requires
const { spreadsheetApp } = require('./SpreadsheetMock');

// noinspection JSValidateTypes
global.SpreadsheetApp = spreadsheetApp;

const getRowByTextConstantResult = 2;
global.Helpers = {
  getRowByText:
    jest.fn((_, text) => (text !== 'unknown_text' && getRowByTextConstantResult) || null),
};

describe('RawFilesRepository', () => {
  it('should be defined', () => {
    expect(RawFilesRepository).toBeDefined();
  });

  describe('constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be instantiable', () => {
      expect(() => new RawFilesRepository('raw_sheet_id')).not.toThrow();
    });

    it('should throw if sheet is not found', () => {
      expect(() => new RawFilesRepository('any_other_sheet_id')).toThrow();
    });
  });

  describe('getKnownPages', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return array of objects with data of non-null pages', () => {
      const knownPages = new RawFilesRepository('raw_sheet_id').getKnownPages();

      expect(knownPages).toEqual([
        {
          url: 'some_url', fileId: 'some_fileId', modifiedAt: 'some_modifiedAt',
        },
        {
          url: 'some_url2', fileId: 'some_fileId2', modifiedAt: 'some_modifiedAt2',
        },
      ]);
    });

    it('should not return objects with null url', () => {
      const knownPages = new RawFilesRepository('raw_sheet_id').getKnownPages();

      expect(knownPages).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ url: '' }),
        ]),
      );
    });
  });

  describe('getKnownUrls', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return array of urls', () => {
      const knownUrls = new RawFilesRepository('raw_sheet_id').getKnownUrls();

      expect(knownUrls).toEqual(['some_url', 'some_url2', 'some_url3']);
    });

    it('should not return null urls', () => {
      const knownUrls = new RawFilesRepository('raw_sheet_id').getKnownUrls();

      expect(knownUrls).toEqual(
        expect.not.arrayContaining(['']),
      );
    });
  });

  describe('getActualHtmlFiles', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return array of objects with data of non-null pages', () => {
      const knownPages = new RawFilesRepository('raw_sheet_id').getActualHtmlFiles();

      expect(knownPages).toEqual([
        {
          url: 'some_url',
          fileId: 'some_fileId',
          modifiedAt: 'some_modifiedAt',
          status: 'some_status',
        },
        {
          url: 'some_url2',
          fileId: 'some_fileId2',
          modifiedAt: 'some_modifiedAt2',
          status: 'some_status2',
        },
      ]);
    });

    test('should not return objects with null fileId', () => {
      const knownPages = new RawFilesRepository('raw_sheet_id').getActualHtmlFiles();

      expect(knownPages).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ fileId: '' }),
        ]),
      );
    });
  });

  describe('addUrls', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should add urls to the end of the sheet', () => {
      /** @type { NewRawHtmlMetaEntry[] } */
      const urlsToAdd = [
        { url: 'url1', createdAt: 'createdAt1' },
        { url: 'url2', createdAt: 'createdAt2' },
      ];

      const repo = new RawFilesRepository('raw_sheet_id');
      repo.addUrls(urlsToAdd);

      // noinspection JSCheckFunctionSignatures -- lint bug
      const mock = SpreadsheetApp.openById('raw_sheet_id')
        .getSheetByName('main')
        .getRange(5, 1, 2, 5)
        .setValues;

      expect(mock).toBeCalledTimes(1);
      expect(mock).toBeCalledWith([
        ['url1', '', '', '', 'createdAt1'],
        ['url2', '', '', '', 'createdAt2'],
      ]);
    });
  });

  describe('saveExtractingResult', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should add status to the end of the sheet', () => {
      const fileId = 'new_fileId';
      const status = 'new_status';
      const modifiedAt = 'new_modifiedAt';

      const repo = new RawFilesRepository('raw_sheet_id');
      repo.saveExtractingResult('some_url', modifiedAt, status, fileId);

      // noinspection JSCheckFunctionSignatures -- lint bug
      const mock = SpreadsheetApp.openById('raw_sheet_id')
        .getSheetByName('main')
        .getRange(getRowByTextConstantResult, 2, 1, 3)
        .setValues;

      expect(mock).toBeCalledTimes(1);
      expect(mock).toBeCalledWith([[fileId, modifiedAt, status]]);
    });

    it('should throw if url is not found in the raw sheet', () => {
      const repo = new RawFilesRepository('raw_sheet_id');
      expect(() => repo.saveExtractingResult(
        'unknown_text',
        'new_modifiedAt',
        'new_status',
        'new_fileId',
      )).toThrow();
    });
  });
});
