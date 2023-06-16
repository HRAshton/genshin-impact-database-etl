async function FetchingServiceTests() {
  const fetchingService = new FetchingService();
  console.log(await fetchingService.fetchAsync2('https://genshin.honeyhunterworld.com/hs_40/?lang=EN'));
}

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

    const fetchResult = UrlFetchApp.fetch(url, { followRedirects: false, muteHttpExceptions: false });
    const location = fetchResult.getAllHeaders().Location;
    if (location) {
      throw new Error(`Redirected to '${location}'.`);
    }

    const htmlBody = fetchResult.getContentText();

    return Promise.resolve(htmlBody);
  }
}

globalRegister(FetchingService);
