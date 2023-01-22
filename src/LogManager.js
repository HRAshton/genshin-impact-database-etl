class LogManager {
  constructor(dbConnector) {
    this.dbConnector = dbConnector;
  }

  saveLog(startTime) {
    const log = Logger.getLog();
    this.dbConnector.saveLog(startTime, log);
  }
}