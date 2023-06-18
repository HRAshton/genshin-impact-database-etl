// Should be equal to the number of rows in the "getRange" mock.
const initRowsCount = 4;

const ranges = {
  raw: {
    withoutStatus: ['A2:C'],
    withStatus: ['A2:D'],
    withStatusNumbersNotation: [4, 1, 4, 1],
    urlsOnly: ['A2:A'],
  },

  parsed: {
    htmlFiles: ['A2:B'],
    jsons: ['D2:D'],
  },

  finalization: {
    keys: ['A:A'],
  },
};

class MockRepository {
  constructor() {
    /** @type { { [key: string]: jest } } */
    this._mocks = {};
    global.MockRepository = this;
  }

  /** Gets or creates a mock for the specified key.
   * @param { string } key - The key of the mock.
   * @param { (...params: any) => any } valueFactory - The factory function that creates the mock.
   * @returns { * }
   */
  getMock(key, valueFactory) {
    if (!this._mocks[key]) {
      this._mocks[key] = jest.fn(valueFactory);
    }

    return this._mocks[key];
  }
}

const mockRepository = new MockRepository();

const spreadsheetApp = {
  /** @param { string } spreadsheetId */
  openById: mockRepository.getMock('spreadsheetApp.openById', (spreadsheetId) => {
    if (spreadsheetId === 'raw_sheet_id') {
      return ({
        getSheetByName: mockRepository.getMock(
          `spreadsheet.openById(${spreadsheetId}).getSheetByName`,
          /** @param { string } sheetName */
          (sheetName) => {
            if (sheetName !== 'main') {
              return null;
            }

            return ({
              getRange: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange`,
                /** @param { string | number } arg1
                 *  @param { string | number } arg2
                 *  @param { string | number } arg3
                 *  @param { unknown } arg4
                 */
                (arg1, arg2, arg3, arg4) => ({
                  getValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).getValues`,
                    () => {
                      if (arg1 === ranges.raw.withoutStatus[0]) {
                        return [
                          ['some_url', 'some_fileId', 'some_modifiedAt'],
                          ['some_url2', 'some_fileId2', 'some_modifiedAt2'],
                          ['', 'some_fileId3', 'some_modifiedAt3'],
                          ['', '', ''],
                        ];
                      }

                      if (arg1 === ranges.raw.withStatus[0]) {
                        return [
                          ['some_url', 'some_fileId', 'some_modifiedAt', 'some_status'],
                          ['some_url2', 'some_fileId2', 'some_modifiedAt2', 'some_status2'],
                          ['some_url3', '', 'some_modifiedAt3', 'some_status3'],
                          ['', '', '', ''],
                        ];
                      }

                      if (arg1 === ranges.raw.urlsOnly[0]) {
                        return [
                          ['some_url'],
                          ['some_url2'],
                          ['some_url3'],
                          [''],
                        ];
                      }

                      if (arg1 === ranges.raw.withStatusNumbersNotation[0]
                        && arg2 === ranges.raw.withStatusNumbersNotation[1]
                        && arg3 === ranges.raw.withStatusNumbersNotation[2]
                        && arg4 === ranges.raw.withStatusNumbersNotation[3]) {
                        return [
                          ['some_url', 'some_fileId', 'some_modifiedAt', 'some_status'],
                          ['some_url2', 'some_fileId2', 'some_modifiedAt2', 'some_status2'],
                          ['some_url3', '', 'some_modifiedAt3', 'some_status3'],
                          ['', '', '', ''],
                        ];
                      }

                      throw new Error(`Unexpected arguments: ${arg1}, ${arg2}, ${arg3}, ${arg4}`);
                    },
                  ),

                  setValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setValues`,
                    () => null,
                  ),
                }),
              ),

              getLastRow: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getLastRow`,
                () => initRowsCount,
              ),
            });
          },
        ),
      });
    }

    if (spreadsheetId === 'parsed_sheet_id') {
      return ({
        getSheetByName: mockRepository.getMock(
          `spreadsheet.openById(${spreadsheetId}).getSheetByName`,
          /** @param { string } sheetName */
          (sheetName) => {
            if (sheetName !== 'main') {
              return null;
            }

            return ({
              getRange: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange`,
                /** @param { string | number } arg1
                 *  @param { string | number } arg2
                 *  @param { string | number } arg3
                 *  @param { unknown } arg4
                 */
                (arg1, arg2, arg3, arg4) => ({
                  getValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).getValues`,
                    () => {
                      if (arg1 === ranges.parsed.htmlFiles[0]) {
                        return [
                          ['some_url', 'some_fileId'],
                          ['some_url2', 'some_fileId2'],
                          ['some_url3', 'some_fileId3'],
                          ['', ''],
                        ];
                      }

                      throw new Error(`Unexpected arguments: ${arg1}, ${arg2}, ${arg3}, ${arg4}`);
                    },
                  ),

                  setValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setValues`,
                    () => null,
                  ),

                  setNote: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setNote`,
                    () => null,
                  ),

                  getNotes: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).getNotes`,
                    () => {
                      if (arg1 === ranges.parsed.jsons[0]) {
                        return [
                          ['some_note'],
                          ['some_note2'],
                          ['some_note3'],
                          [''],
                        ];
                      }

                      throw new Error(`Unexpected arguments: ${arg1}, ${arg2}, ${arg3}, ${arg4}`);
                    },
                  ),
                }),
              ),

              getLastRow: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getLastRow`,
                () => initRowsCount,
              ),

              insertRowsAfter: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).insertRowsAfter`,
                () => null,
              ),
            });
          },
        ),
      });
    }

    if (spreadsheetId === 'dashboard_sheet_id') {
      return ({
        getSheetByName: mockRepository.getMock(
          `spreadsheet.openById(${spreadsheetId}).getSheetByName`,
          /** @param { string } sheetName */
          (sheetName) => {
            if (sheetName !== 'stats') {
              return null;
            }

            return ({
              getRange: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange`,
                /** @param { string | number } arg1
                 *  @param { string | number } arg2
                 *  @param { string | number } arg3
                 *  @param { unknown } arg4
                 */
                (arg1, arg2, arg3, arg4) => ({
                  setValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setValues`,
                    () => null,
                  ),
                }),
              ),
            });
          },
        ),
      });
    }

    if (spreadsheetId === 'fin_sheet_id') {
      return ({
        getSheetByName: mockRepository.getMock(
          `spreadsheet.openById(${spreadsheetId}).getSheetByName`,
          /** @param { string } sheetName */
          (sheetName) => {
            if (sheetName !== 'finSheet') {
              return null;
            }

            return ({
              getRange: mockRepository.getMock(
                `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange`,
                /** @param { string | number } arg1
                 *  @param { string | number } arg2
                 *  @param { string | number } arg3
                 *  @param { unknown } arg4
                 */
                (arg1, arg2, arg3, arg4) => ({
                  setValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setValues`,
                    () => null,
                  ),

                  setNotes: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).setNotes`,
                    () => null,
                  ),

                  getValues: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).getValues`,
                    () => {
                      if (arg1 === ranges.finalization.keys[0]) {
                        return [
                          ['some_id1'],
                          ['some_id2'],
                          ['some_id3'],
                          ['some_id4'],
                        ];
                      }

                      throw new Error(`Unexpected arguments: ${arg1}, ${arg2}, ${arg3}, ${arg4}`);
                    },
                  ),

                  getNote: mockRepository.getMock(
                    `spreadsheet.openById(${spreadsheetId}).getSheetByName(${sheetName}).getRange(${arg1}, ${arg2}, ${arg3}, ${arg4}).getNote`,
                    () => '{"Id": "some_id", "Name": "some_name"}',
                  ),
                }),
              ),
            });
          },
        ),
      });
    }

    return null;
  }),
};

module.exports = {
  initRowsCount,
  ranges,
  spreadsheetApp,
};
