const logDb = require('./../db');

module.exports.attach = app => {

  /**
   * Insert a log entry
   */
  app.post('/api/logs', async (req, res) => {
    try {
      const logEntry = req.body;
      const newDoc = await logDb.insertLog(logEntry);
      res.status(201).json({ message: 'Log saved successfully', data: newDoc });
    } catch (error) {
      console.error('Failed to insert log:', error);
      res.status(500).json({ error: 'Failed to save log' });
    }
  });

  /**
   * Query logs with pagination
   */
  app.post('/api/query', async (req, res) => {
    try {
      const {
        startTimestamp,
        endTimestamp,
        pageSize = 10,
        page = 1
      } = req.body;

      const result = await logDb.queryLogs({
        startTimestamp,
        endTimestamp,
        pageSize,
        page
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Failed to query logs:', error);
      res.status(500).json({ error: 'Failed to retrieve logs' });
    }
  });
}
