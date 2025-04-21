const Datastore = require('nedb');

/**
 * Database service for logging operations
 */
class LogDatabase {
  constructor() {
    // Initialize an in-memory database
    this.db = new Datastore();
    console.log('Log database initialized');
  }

  /**
   * Insert a log entry into the database
   * @param {Object} logEntry - The log entry to insert
   * @returns {Promise<Object>} - The inserted document
   */
  insertLog(logEntry) {
    return new Promise((resolve, reject) => {
      this.db.insert(logEntry, (err, newDoc) => {
        if (err) {
          console.error('Failed to insert log:', err);
          reject(err);
        } else {
          resolve(newDoc);
        }
      });
    });
  }

  /**
   * Query logs with pagination and time filtering
   * @param {Object} options - Query options
   * @param {number} options.startTimestamp - Start timestamp for filtering
   * @param {number} options.endTimestamp - End timestamp for filtering
   * @param {number} options.pageSize - Number of logs per page
   * @param {number} options.page - Page number
   * @returns {Promise<Object>} - The query results with pagination info
   */
  queryLogs({ startTimestamp, endTimestamp, pageSize = 10, page = 1 }) {
    return new Promise((resolve, reject) => {
      const query = {};

      // Set time range filters
      const start = startTimestamp ? new Date(startTimestamp) : new Date(0);
      const end = endTimestamp ? new Date(endTimestamp) : new Date();
      query.timestamp = { $gte: start.getTime(), $lte: end.getTime() };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      // Find records with pagination
      this.db.find(query)
        .sort({ timestamp: -1 }) // Sort by timestamp descending (newest first)
        .skip(skip)
        .limit(limit)
        .exec((err, logs) => {
          if (err) {
            console.error('Failed to query logs:', err);
            reject(err);
            return;
          }

          // Get total count for pagination
          this.db.count(query).exec((countErr, totalCount) => {
            if (countErr) {
              console.error('Failed to count logs:', countErr);
              reject(countErr);
              return;
            }

            resolve({
              data: logs,
              total: totalCount,
              page: parseInt(page),
              pageSize: parseInt(pageSize),
            });
          });
        });
    });
  }
}

// Create and export a singleton instance
const logDatabase = new LogDatabase();
module.exports = logDatabase;

