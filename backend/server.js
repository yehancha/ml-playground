const express = require('express');
const ServiceRegistry = require('./src/serviceRegistry');
const modelManager = require('./src/models/modelManager');
const { useCors } = require('./src/middlewares/cors');
const { useLogger } = require('./src/middlewares/logger');
const modelRoutes = require('./src/routes/modelRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const port = process.env.BACKEND_PORT;
const serviceRegistry = new ServiceRegistry(modelManager);
const app = express();

// Use middlewares
useCors(app);
app.use(express.json());
useLogger(app);

// Attach routes
modelRoutes.attach(app, modelManager);
healthRoutes.attach(app);

// Start the server
const server = app.listen(port, () => {
	console.log(`Backend server listening at ${process.env.SERVICE_URL}`);
	console.log(`Available models: ${modelManager.getAvailableModels().join(', ')}`);

	// Register with registry after startup
	serviceRegistry.register();
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down backend service...');
  
  // Unregister from registry before shutting down
  serviceRegistry.unregister()
    .finally(() => {
      server.close(() => {
        console.log('Backend service closed');
        process.exit(0);
      });
      
      // If server.close takes too long, force exit
      setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 5000);
    });
}
