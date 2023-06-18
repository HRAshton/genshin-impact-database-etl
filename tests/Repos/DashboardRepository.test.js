require('../../src/Helpers/GlobalRegister');
require('../../src/Repos/DashboardRepository');

// eslint-disable-next-line import/no-unresolved,@typescript-eslint/no-var-requires
const { spreadsheetApp } = require('./SpreadsheetMock');
// noinspection JSValidateTypes
global.SpreadsheetApp = spreadsheetApp;

describe('DashboardRepository', () => {
  describe('constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be instantiable', () => {
      expect(() => new DashboardRepository('dashboard_sheet_id')).not.toThrow();
    });

    it('should throw if sheet is not found', () => {
      expect(() => new DashboardRepository('any_other_sheet_id')).toThrow();
    });
  });

  describe('saveData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save data to the sheet', () => {
      const dashboardRepository = new DashboardRepository('dashboard_sheet_id');

      const date = new Date(2020, 1, 1);

      /** @type { DashboardStatisticsEntry[] } */
      const data = [
        {
          langCode: 'en',
          isCurrent: true,
          extractData: {
            files: 1,
            empty: 2,
            outdated: 3,
            actual: 4,
            oldest: date,
            median: date,
            newest: date,
          },
          transformData: {
            total: 8,
            successful: 9,
            unsuccessful: 10,
          },
          finalizationData: {
            total: 11,
          },
        },
        {
          langCode: 'fr',
          isCurrent: false,
          extractData: {
            files: 1,
            empty: 2,
            outdated: 3,
            actual: 4,
            oldest: date,
            median: date,
            newest: date,
          },
          transformData: {
            total: 8,
            successful: 9,
            unsuccessful: 10,
          },
          finalizationData: {
            total: 11,
          },
        },
      ];

      dashboardRepository.saveData(data);

      const rangeMock = spreadsheetApp.openById('dashboard_sheet_id')
        .getSheetByName('stats')
        .getRange(3, 1, 2, 13);
      expect(rangeMock.setValues).toHaveBeenCalledWith([
        ['en', 1, 2, 3, 4, date, date, date, 8, 9, 10, 11, '•'],
        ['fr', 1, 2, 3, 4, date, date, date, 8, 9, 10, 11, ''],
      ]);
    });
  });
});
