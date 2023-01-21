class FetchingService {
    async fetchAsync(url) {
        return new Promise(resolve => resolve(UrlFetchApp.fetch(url).getContentText()));
    }
}