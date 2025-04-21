const express = require('express');
const cors = require('cors');
const ServiceRegistry = require('./src/serviceRegistry');

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

// Create service registry
const registry = new ServiceRegistry(HEALTH_CHECK_INTERVAL);

// Middleware
app.use(express.json());
app.use(cors());

/**
 * Register a service
 * POST /register
 * Request body: { url: string, models: [{ name: string, type: string }] }
 */
app.post('/register', (req, res) => {
  const { url, models } = req.body;
  
  if (!url || !models) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: url and models'
    });
  }
  
  const success = registry.registerService(url, models);
  
  if (success) {
    res.status(200).json({
      success: true,
      message: `Service registered: ${url}`
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Failed to register service'
    });
  }
});

/**
 * Unregister a service
 * DELETE /unregister
 * Request body: { url: string }
 */
app.delete('/unregister', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: url'
    });
  }
  
  const success = registry.unregisterService(url);
  
  if (success) {
    res.status(200).json({
      success: true,
      message: `Service unregistered: ${url}`
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Service not found or already unregistered'
    });
  }
});

/**
 * Get all registered services
 * GET /services
 */
app.get('/services', (req, res) => {
  const services = registry.getAllServices();
  
  res.status(200).json({
    success: true,
    services: services
  });
});

/**
 * Get services by type
 * GET /services/types/:type
 */
app.get('/services/types/:type', (req, res) => {
  const type = req.params.type;
  
  if (!type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: type'
    });
  }
  
  const result = registry.getServicesByType(type);
  
  res.status(200).json(result);
});

/**
 * Health endpoint for the registry itself
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

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

