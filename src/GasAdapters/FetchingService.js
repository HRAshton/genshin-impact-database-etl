class FetchingService {
  async fetchAsync(url) {
    Utilities.sleep(500);
    return new Promise(resolve => resolve(UrlFetchApp.fetch(url).getContentText()));
  }
}