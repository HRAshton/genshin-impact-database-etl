require('../../src/Helpers/GlobalRegister');
require('../../src/Helpers/Assert');
require('../../src/Services/FinalizationService');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

describe('FinalizationService', () => {
  const logManager = {
    saveLog: jest.fn(),
  };

  const finalizationRepository = {
    saveFinalizationData: jest.fn(),
  };

  const baseListJson = fs.readFileSync('./tests/assets/ParsedJsonItemWithList.json', 'utf8');
  const baseTablesJson = fs.readFileSync('./tests/assets/ParsedJsonItemWithTables.json', 'utf8');
  const parsedFilesRepository = {
    getAllParsedJsons: jest.fn(),
  };

  global.Constants = {
    baseUrl: jest.fn(),
    scriptTimeoutMs: jest.fn().mockReturnValue(6000),
    urlReloadPeriodSecs: jest.fn().mockReturnValue(0),
  };

  /** @type { FinalizationService } */
  let finalizationService = null;

  const recreateService = () => {
    finalizationService = new FinalizationService(
      'LANG',
      parsedFilesRepository,
      finalizationRepository,
      logManager,
    );
  };

  const resetMocks = () => {
    jest.clearAllMocks();

    Constants.scriptTimeoutMs.mockReturnValue(60000);
    finalizationRepository.saveFinalizationData.mockReset();
    parsedFilesRepository.getAllParsedJsons.mockReturnValue([
      baseListJson,
      baseListJson.replace('fam_book_family_1008', 'some_id_1'),
      baseListJson.replace('fam_book_family_1008', 'some_id_2'),
      baseTablesJson,
    ]);

    recreateService();
  };

  describe('saving logs', () => {
    beforeEach(resetMocks);

    it('should save the log', () => {
      // Act
      finalizationService.run();

      // Assert
      expect(logManager.saveLog).toHaveBeenCalledTimes(1);
    });

    it('should save the log even if the finalization fails', () => {
      // Arrange
      finalizationRepository.saveFinalizationData.mockImplementation(() => {
        throw new Error('Some error');
      });

      // Act
      finalizationService.run();

      // Assert
      expect(logManager.saveLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('saving finalized data', () => {
    beforeEach(resetMocks);

    it('should save finalized data', () => {
      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ key: 'LANG/fam_book_family_1008' }),
          expect.objectContaining({ key: 'LANG/some_id_1' }),
          expect.objectContaining({ key: 'LANG/some_id_2' }),
        ]),
      );
    });

    it('should skip items with no id', () => {
      // Arrange
      parsedFilesRepository.getAllParsedJsons.mockReturnValue([
        baseListJson.replace('fam_book_family_1008', '').replace('tag', 'fake_tag__no_id'),
        baseListJson.replace('fam_book_family_1008', 'some_id_2').replace('tag', 'fake_tag'),
      ]);

      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('fake_tag') }),
        ]),
      );
      expect(finalizationRepository.saveFinalizationData).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('fake_tag__no_id') }),
        ]),
      );
    });

    it('should skip items with no name', () => {
      // Arrange
      parsedFilesRepository.getAllParsedJsons.mockReturnValue([
        baseListJson.replace('Records of Jueyun', '').replace('tag', 'fake_tag__no_name'),
        baseListJson.replace('Records of Jueyun', 'name_2').replace('tag', 'fake_tag'),
      ]);

      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('fake_tag') }),
        ]),
      );
      expect(finalizationRepository.saveFinalizationData).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('fake_tag__no_name') }),
        ]),
      );
    });

    it('should skip items with no json', () => {
      // Arrange
      parsedFilesRepository.getAllParsedJsons.mockReturnValue(['']);

      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith([]);
    });

    it('should write Id, Name, Main and Metadata sections to result', () => {
      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('"Id":') }),
          expect.objectContaining({ value: expect.stringContaining('"Name":') }),
          expect.objectContaining({ value: expect.stringContaining('"Main":') }),
        ]),
      );
    });

    it('should write "Tables" section to result', () => {
      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('"Drop":') }),
        ]),
      );
    });

    it('create "List" property instead of "Tables" if there is only one table without Id', () => {
      // Act
      finalizationService.run();

      // Assert
      expect(finalizationRepository.saveFinalizationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('"List":') }),
        ]),
      );
      expect(finalizationRepository.saveFinalizationData).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: expect.stringContaining('"Tables":') }),
        ]),
      );
    });
  });
});
