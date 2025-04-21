const express = require('express');
const cors = require('cors');
const ServiceCache = require('./src/serviceCache');
const UpstreamHandler = require('./src/upstreamHandler');
const backendRoutes = require('./src/routes/backendRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const loggerRoutes = require('./src/routes/loggerRoutes');
const registryRoutes = require('./src/routes/registryRoutes');

const PORT = process.env.PROXY_PORT;
const CACHE_TTL = process.env.SERVICE_CACHE_TTL;

const app = express();

const cache = new ServiceCache(CACHE_TTL);
const upstreamHandler = new UpstreamHandler(cache);

// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Attach routes
healthRoutes.attach(app);
registryRoutes.attach(app, cache);
backendRoutes.attach(app, upstreamHandler);
loggerRoutes.attach(app, upstreamHandler);

/**
 * Default fallback for unhandled routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy service listening at http://localhost:${PORT}`);
  
  // Periodically clean up expired cache entries
  setInterval(() => {
    try {
      cache.purgeExpired();
    } catch (error) {
      console.error('Error purging expired cache entries:', error);
    }
  }, 60000); // Every minute
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down proxy service...');
  process.exit(0);
}
