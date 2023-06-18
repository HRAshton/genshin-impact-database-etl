require('../../src/Helpers/GlobalRegister');
require('../../src/Services/TransformService');

describe('TransformService', () => {
  const fileSystemConnector = {
    readAllText: jest.fn(),
  };

  const logManager = {
    saveLog: jest.fn(),
  };

  const rawFilesRepository = {
    getActualHtmlFiles: jest.fn().mockReturnValue([
      /* eslint-disable object-curly-newline */
      { url: 'item_1', modifiedAt: 'modified_at_1', fileId: 'file_id_1', status: 'OK' },
      { url: 'item_2', modifiedAt: 'modified_at_2', fileId: 'changed_file_id_2', status: 'OK' },
      { url: 'new_item', modifiedAt: 'new_modified_at', fileId: 'new_file_id', status: 'OK' },
      { url: 'bad_item', modifiedAt: 'bad_modified_at', fileId: 'bad_file_id', status: 'Error' },
      /* eslint-enable object-curly-newline */
    ]),
  };

  const parsedFilesRepository = {
    getParsedHtmlFiles: jest.fn().mockReturnValue([
      { url: 'item_1', fileId: 'file_id_1' },
      { url: 'item_2', fileId: 'file_id_2' },
      { url: 'item_4', fileId: 'file_id_4' },
    ]),
    saveParsingResult: jest.fn(),
  };

  const pageParser = {
    parse: jest.fn(),
  };

  const navBarParser = {
    parse: jest.fn(),
  };

  global.Constants = {
    baseUrl: jest.fn(),
    scriptTimeoutMs: jest.fn().mockReturnValue(6000),
    urlReloadPeriodSecs: jest.fn().mockReturnValue(0),
  };

  /** @type { TransformService } */
  let transformService = null;

  const recreateService = () => {
    transformService = new TransformService(
      rawFilesRepository,
      parsedFilesRepository,
      fileSystemConnector,
      pageParser,
      navBarParser,
      logManager,
    );
  };

  const resetMocks = () => {
    jest.clearAllMocks();

    pageParser.parse.mockImplementation(() => 'parsed content');
    navBarParser.parse.mockImplementation(
      () => ['link_1', 'link_2', 'link_3'].map((link) => `/${link}/?lang=LL`),
    );
    Constants.scriptTimeoutMs.mockReturnValue(60000);
    fileSystemConnector.readAllText.mockReturnValue('file content');
  };

  describe('saving logs', () => {
    beforeEach(resetMocks);

    it('should save the log', async () => {
      // Arrange
      recreateService();

      // Act
      transformService.transform();

      // Assert
      expect(logManager.saveLog).toHaveBeenCalledTimes(1);
    });

    it('should save the log even if the timeout is exceeded', async () => {
      // Arrange
      Constants.scriptTimeoutMs.mockReturnValue(1);
      recreateService();

      // Act
      transformService.transform();

      // Assert
      expect(pageParser.parse).not.toHaveBeenCalled();
      expect(logManager.saveLog).toHaveBeenCalledTimes(1);
    });

    it('should save the log even if the error is thrown', async () => {
      // Arrange
      fileSystemConnector.readAllText.mockImplementation(() => {
        throw new Error('error');
      });
      recreateService();

      // Act
      transformService.transform();

      // Assert
      expect(pageParser.parse).not.toHaveBeenCalled();
      expect(logManager.saveLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeout tests', () => {
    beforeEach(resetMocks);

    it('should finish by timeout', async () => {
      // Arrange
      const startTime = new Date();

      Constants.scriptTimeoutMs.mockReturnValue(1500);

      pageParser.parse.mockImplementation(() => {
        const initDate = new Date();
        while (new Date() - initDate < 1000) {
          // do nothing
        }
      });

      recreateService();

      // Act
      transformService.transform();

      // Assert
      expect(new Date().getTime() - startTime.getTime()).toBeCloseTo(2000, -3);
      expect(pageParser.parse).toHaveBeenCalledTimes(2);
    });
  });

  describe('processing pages', () => {
    beforeEach(() => {
      resetMocks();
      recreateService();
    });

    it('should transform if the raw file is OK and the parsed file is missing', async () => {
      // Act
      transformService.transform();

      // Assert
      expect(pageParser.parse).toHaveBeenCalled();
      expect(parsedFilesRepository.saveParsingResult)
        .toHaveBeenCalledWith('new_item', expect.anything(), expect.anything(), expect.anything());
    });

    it('should transform if the raw file is OK and the parsed file is changed', async () => {
      // Act
      transformService.transform();

      // Assert
      expect(pageParser.parse).toHaveBeenCalled();
      expect(parsedFilesRepository.saveParsingResult)
        .toHaveBeenCalledWith('item_2', expect.anything(), expect.anything(), expect.anything());
    });

    it('should not transform if the raw file is OK and the parsed file is present', async () => {
      // Act
      transformService.transform();

      // Assert
      expect(parsedFilesRepository.saveParsingResult)
        .not
        .toHaveBeenCalledWith('item_1', expect.anything(), expect.anything(), expect.anything());
    });

    it('should not transform if the raw file is not OK', async () => {
      // Act
      transformService.transform();

      // Assert
      expect(parsedFilesRepository.saveParsingResult)
        .not
        .toHaveBeenCalledWith('bad_item', expect.anything(), expect.anything(), expect.anything());
    });
  });

  describe('processing navigation bar link', () => {
    beforeEach(() => {
      resetMocks();
      recreateService();
    });

    it('should process navigation bar link', async () => {
      // Act
      transformService.transform();

      // Assert
      expect(navBarParser.parse).toHaveBeenCalledWith('file content');
      expect(parsedFilesRepository.saveParsingResult).toHaveBeenCalledWith(
        '_internal_navbar',
        expect.anything(),
        expect.stringContaining('link_1'),
        expect.anything(),
      );
    });

    it('should not throw or save if the navigation bar link is not present', async () => {
      // Arrange
      navBarParser.parse.mockReturnValue([]);

      // Act & Assert
      expect(() => transformService.transform()).not.toThrow();

      // Assert
      expect(parsedFilesRepository.saveParsingResult).not.toHaveBeenCalledWith(
        '_internal_navbar',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should not throw or save if there are no outdated pages', async () => {
      // Arrange
      rawFilesRepository.getActualHtmlFiles.mockReturnValue([]);

      // Act & Assert
      expect(() => transformService.transform()).not.toThrow();

      // Assert
      expect(parsedFilesRepository.saveParsingResult).not.toHaveBeenCalledWith(
        '_internal_navbar',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
