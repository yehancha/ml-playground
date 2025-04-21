const express = require('express');
const cors = require('cors');
const Datastore = require('nedb');
const app = express();
const port = 3020;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3010'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Initialize an in-memory database
const db = new Datastore();

/**
 * Insert a log entry
 */
app.post('/api/logs', async (req, res) => {
  const logEntry = req.body;

  db.insert(logEntry, (err, newDoc) => {
    if (err) {
      console.error('Failed to insert log:', err);
      return res.status(500).json({ error: 'Failed to save log' });
    }
    res.status(201).json({ message: 'Log saved successfully', data: newDoc });
  });
});

app.post('/api/query', async (req, res) => {
  const {
    startTimestamp,
    endTimestamp,
    pageSize = 10,
    page = 1
  } = req.query;

  const query = {};

  const start = startTimestamp ? new Date(startTimestamp) : new Date(0);
  const end = endTimestamp ? new Date(endTimestamp) : new Date();

  query.timestamp = { $gte: start.getTime(), $lte: end.getTime() };

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  db.find(query)
    .sort({ timestamp: -1 }) // Sort by timestamp descending (newest first)
    .skip(skip)
    .limit(limit)
    .exec((err, logs) => {
      if (err) {
        console.error('Failed to query logs:', err);
        return res.status(500).json({ error: 'Failed to retrieve logs' });
      }

      db.count(query).exec((countErr, totalCount) => {
        if (countErr) {
          console.error('Failed to count logs:', countErr);
          return res.status(500).json({ error: 'Failed to retrieve log count' });
        }

        res.status(200).json({
          data: logs,
          total: totalCount,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
        });
      });
    });
});

app.listen(port, () => {
  console.log(`Logger server listening at http://localhost:${port}`);
});
