class FetchingService {
  constructor() {
    this.callsTimeoutMs = 500;
    this.lastRequestTimestamp = new Date().getTime();
  }

  async fetchAsync(url) {
    const timestamp = new Date().getTime();
    const timeToWait = this.callsTimeoutMs - (timestamp - this.lastRequestTimestamp);
    Utilities.sleep(Math.max(timeToWait, 0));
    this.lastRequestTimestamp = timestamp;

    return new Promise(resolve => resolve(UrlFetchApp.fetch(url).getContentText()));
  }
}