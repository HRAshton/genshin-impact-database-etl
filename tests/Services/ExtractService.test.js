require('../../src/Helpers/GlobalRegister');
require('../../src/Services/ExtractService');

describe('ExtractService', () => {
  const baseUrl = 'https://example.com/';
  const urlReloadPeriodSecs = 60 * 60 * 24;
  const scriptTimeoutMs = 60000;

  const fileSystemConnector = {
    createFile: jest.fn(),
  };

  const logManager = {
    saveLog: jest.fn(),
  };

  const rawFilesRepository = {
    getKnownPages: jest.fn(),
    saveExtractingResult: jest.fn(),
  };

  const fetcher = {
    fetchAsync: jest.fn(),
  };

  global.Constants = {
    baseUrl: jest.fn().mockReturnValue(baseUrl),
    scriptTimeoutMs: jest.fn().mockReturnValue(scriptTimeoutMs),
    urlReloadPeriodSecs: jest.fn().mockReturnValue(urlReloadPeriodSecs),
  };

  /** @type { ExtractService } */
  let extractService = null;

  const recreateService = () => {
    extractService = new ExtractService(
      fetcher,
      rawFilesRepository,
      fileSystemConnector,
      logManager,
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    fetcher.fetchAsync.mockImplementation(() => 'file content');
    Constants.scriptTimeoutMs.mockReturnValue(60000);
    fileSystemConnector.createFile.mockReturnValue('new_file_id');
  });

  describe('timeout tests', () => {
    it('should finish by timeout', async () => {
      // Arrange
      const startTime = new Date();

      rawFilesRepository.getKnownPages.mockReturnValue([
        { url: 'item1', modifiedAt: '', fileId: '' },
        { url: 'item2', modifiedAt: '', fileId: '' },
        { url: 'item3', modifiedAt: '', fileId: '' },
      ]);

      Constants.scriptTimeoutMs.mockReturnValue(1500);

      fetcher.fetchAsync.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(''), 1000);
        }),
      );

      recreateService();

      // Act
      await extractService.extractAsync();

      // Assert
      expect(new Date().getTime() - startTime.getTime()).toBeCloseTo(2000, -3);
      expect(fetcher.fetchAsync).toHaveBeenCalledTimes(2);
    });
  });

  it(
    'should process unprocessed files firstly, then outdated files in order of modification date',
    async () => {
      // Arrange
      rawFilesRepository.getKnownPages.mockReturnValue([
        { url: 'item1', modifiedAt: '', fileId: '' },
        { url: 'item2', modifiedAt: '2002-01-01', fileId: '' },
        { url: 'item3', modifiedAt: '2001-01-01', fileId: '' },
        { url: 'item4', modifiedAt: '2003-01-01', fileId: '' },
        { url: 'item5', modifiedAt: '', fileId: '' },
        { url: 'item6', modifiedAt: '2004-01-01', fileId: '' },
      ]);

      recreateService();

      // Act
      await extractService.extractAsync();

      // Assert
      expect(fetcher.fetchAsync).toHaveBeenCalledTimes(6);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(1, `${baseUrl}item1`);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(2, `${baseUrl}item5`);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(3, `${baseUrl}item3`);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(4, `${baseUrl}item2`);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(5, `${baseUrl}item4`);
      expect(fetcher.fetchAsync).toHaveBeenNthCalledWith(6, `${baseUrl}item6`);
    },
  );

  it('should fetch only old files', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '2001-01-01', fileId: '' },
      { url: 'item2', modifiedAt: '2002-01-01', fileId: '' },
      { url: 'item3', modifiedAt: '3001-01-01', fileId: '' },
    ]);

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(fetcher.fetchAsync).toHaveBeenCalledWith(`${baseUrl}item1`);
    expect(fetcher.fetchAsync).toHaveBeenCalledWith(`${baseUrl}item2`);
    expect(fetcher.fetchAsync).not.toHaveBeenCalledWith(`${baseUrl}item3`);
  });

  it('should save all files', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '', fileId: '' },
      { url: 'item2', modifiedAt: '', fileId: '' },
      { url: 'item3', modifiedAt: '', fileId: '' },
    ]);

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(fileSystemConnector.createFile).toHaveBeenCalledTimes(3);
    expect(fileSystemConnector.createFile).toHaveBeenCalledWith('item1.html', 'file content');
    expect(fileSystemConnector.createFile).toHaveBeenCalledWith('item2.html', 'file content');
    expect(fileSystemConnector.createFile).toHaveBeenCalledWith('item3.html', 'file content');
  });

  it('should register all files', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '', fileId: '' },
      { url: 'item2', modifiedAt: '', fileId: '' },
    ]);

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(rawFilesRepository.saveExtractingResult).toHaveBeenCalledTimes(2);
    expect(rawFilesRepository.saveExtractingResult)
      .toHaveBeenCalledWith('item1', expect.any(String), 'OK', 'new_file_id');
    expect(rawFilesRepository.saveExtractingResult)
      .toHaveBeenCalledWith('item2', expect.any(String), 'OK', 'new_file_id');
  });

  it('should register error if file is not fetched', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '', fileId: '' },
      { url: 'item2', modifiedAt: '', fileId: '' },
    ]);

    fetcher.fetchAsync.mockImplementation(() => {
      throw new Error('some_error');
    });

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(rawFilesRepository.saveExtractingResult).toHaveBeenCalledTimes(2);
    expect(rawFilesRepository.saveExtractingResult)
      .toHaveBeenCalledWith('item1', expect.any(String), 'Error: some_error', expect.any(String));
    expect(rawFilesRepository.saveExtractingResult)
      .toHaveBeenCalledWith('item2', expect.any(String), 'Error: some_error', expect.any(String));
  });

  it('should transform url to file name', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1_88?lang=smth&ARG2=val_2', modifiedAt: '', fileId: '' },
    ]);

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(fileSystemConnector.createFile)
      .toHaveBeenCalledWith('item1_88_lang=smth&ARG2=val_2.html', expect.any(String));
  });

  it('should save log', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([]);

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(logManager.saveLog).toHaveBeenCalledTimes(1);
  });

  it('should not register file if it is not fetched', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '', fileId: '' },
    ]);

    fileSystemConnector.createFile.mockReturnValue('');

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(fileSystemConnector.createFile).toHaveBeenCalled();
    expect(rawFilesRepository.saveExtractingResult).not.toHaveBeenCalled();
  });

  it('should break execution on quota exceeded', async () => {
    // Arrange
    rawFilesRepository.getKnownPages.mockReturnValue([
      { url: 'item1', modifiedAt: '', fileId: '' },
      { url: 'item2', modifiedAt: '', fileId: '' },
    ]);

    let i = 0;
    fetcher.fetchAsync.mockImplementation(() => {
      if (i === 0) {
        i += 1;
        return 'file content';
      }

      throw new Error('Service invoked too many times for one day: urlfetch');
    });

    recreateService();

    // Act
    await extractService.extractAsync();

    // Assert
    expect(fetcher.fetchAsync).toHaveBeenCalledTimes(2);
    expect(rawFilesRepository.saveExtractingResult).toHaveBeenCalledTimes(1);
  });
});
