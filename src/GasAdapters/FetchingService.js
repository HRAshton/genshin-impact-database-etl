class FetchingService {
  constructor() {
    this._callsTimeoutMs = Constants.httpRequestsTimeoutMs();
    this._lastRequestTimestamp = new Date().getTime();
  }

  //* * @returns { Promise<string> } */
  async fetchAsync(url) {
    const timestamp = new Date().getTime();
    const timeToWait = this._callsTimeoutMs - (timestamp - this._lastRequestTimestamp);
    Utilities.sleep(Math.max(timeToWait, 0));
    this._lastRequestTimestamp = timestamp;

    const fetchResult = UrlFetchApp.fetch(url, {
      followRedirects: false,
      muteHttpExceptions: false,
    });
    const location = fetchResult.getAllHeaders().Location;
    if (location) {
      throw new Error(`Redirected to '${location}'.`);
    }

    const htmlBody = fetchResult.getContentText();

    return Promise.resolve(htmlBody);
  }
}

globalRegister(FetchingService);
