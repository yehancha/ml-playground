const express = require('express');
const cors = require('cors');
const ServiceRegistry = require('./src/serviceRegistry');
const healthRoutes = require('./src/routes/healthRoutes');
const registryRoutes = require('./src/routes/registryRoutes');
const servicesRoutes = require('./src/routes/servicesRoutes');

// Environment variables with defaults
const PORT = process.env.REGISTRY_PORT || 3040;
const HEALTH_CHECK_INTERVAL = process.env.HEALTH_CHECK_INTERVAL || 30000;

// Create the Express app
const app = express();

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const registry = new ServiceRegistry(HEALTH_CHECK_INTERVAL);

// Use middleware
app.use(express.json());
app.use(cors());

// Attach routes
healthRoutes.attach(app);
registryRoutes.attach(app, registry);
servicesRoutes.attach(app, registry);

// Start the server
app.listen(PORT, () => {
  console.log(`Registry service listening at http://localhost:${PORT}`);
  
  // Start periodic health checks
  registry.startHealthChecks();
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down registry service...');
  registry.stopHealthChecks();
  process.exit(0);
}
