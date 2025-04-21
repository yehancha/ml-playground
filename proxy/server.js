const express = require('express');
const cors = require('cors');
const LoadBalancer = require('./src/loadBalancer');
const ServiceCache = require('./src/serviceCache');

// Environment variables with defaults
const PORT = process.env.PROXY_PORT || 3030;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3020';
const LOGGER_URL = process.env.LOGGER_URL || 'http://localhost:3040';
const CACHE_TTL = process.env.SERVICE_CACHE_TTL || 30000;

// Create the Express app
const app = express();

// Initialize cache and load balancer
const cache = new ServiceCache(CACHE_TTL);
const loadBalancer = new LoadBalancer();

// Middleware
app.use(express.json());
app.use(cors());

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Define helper functions using the initialized cache
const serviceUtils = {
  /**
   * Get backend services for a specific model
   * @param {string} modelName - Model name to get services for
   * @param {ServiceCache} cacheInstance - Cache instance to use
   * @returns {Promise<Array>} - Array of backend service URLs
   */
  async getServicesForModel(modelName, cacheInstance) {
    const cacheKey = `model:${modelName}`;
    const cachedData = cacheInstance.get(cacheKey);
    
    if (cachedData.hit) {
      return cachedData.data;
    }
    
    try {
      // Fetch from registry if not in cache
      const response = await fetch(`${REGISTRY_URL}/services`);
      
      if (!response.ok) {
        throw new Error(`Registry returned ${response.status}`);
      }
      
      const data = await response.json();
      const services = data.services || {};
      
      // Find all services that support this model
      const serviceUrls = [];
      Object.entries(services).forEach(([url, service]) => {
        if (service.models && service.models[modelName] && service.healthStatus) {
          serviceUrls.push(url);
        }
      });
      
      // Cache the result
      cacheInstance.set(cacheKey, serviceUrls);
      
      return serviceUrls;
    } catch (error) {
      console.error(`Error getting services for model ${modelName}:`, error);
      throw error;
    }
  },

  /**
   * Get all models of a specific type
   * @param {string} type - Model type to filter by
   * @param {ServiceCache} cacheInstance - Cache instance to use
   * @returns {Promise<Object>} - Object with available models
   */
  async getModelsByType(type, cacheInstance) {
    const cacheKey = `type:${type}`;
    const cachedData = cacheInstance.get(cacheKey);
    
    if (cachedData.hit) {
      return cachedData.data;
    }
    
    try {
      // Fetch from registry if not in cache
      const response = await fetch(`${REGISTRY_URL}/services/types/${type}`);
      
      if (!response.ok) {
        throw new Error(`Registry returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      cacheInstance.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error getting models for type ${type}:`, error);
      throw error;
    }
  }
};
/**
 * Forward a request to the appropriate backend service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} modelName - Model name to use
 * @returns {Promise} - Promise that resolves when request is handled
 */
async function forwardToBackend(req, res, modelName) {
  try {
    // Get available services for the model
    const services = await serviceUtils.getServicesForModel(modelName, cache);
    
    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No services available for model: ${modelName}`
      });
    }
    
    // Get next service to use (round-robin)
    const serviceUrl = loadBalancer.getNextService(modelName, services);
    
    if (!serviceUrl) {
      return res.status(503).json({
        success: false,
        error: `All services for model ${modelName} are currently unavailable`
      });
    }
    
    // Build the target URL (same path as original request)
    const targetUrl = `${serviceUrl}${req.originalUrl}`;
    
    console.log(`Forwarding request to: ${targetUrl}`);
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    // Check if the response is ok
    if (!response.ok) {
      // If service failed, mark it as failed in load balancer
      if (response.status >= 500) {
        loadBalancer.markServiceFailed(serviceUrl);
        
        // Try another service if available
        const remainingServices = services.filter(url => url !== serviceUrl);
        if (remainingServices.length > 0) {
          console.log(`Retrying with another service for model ${modelName}`);
          req.retryCount = (req.retryCount || 0) + 1;
          
          // Prevent infinite retry loops
          if (req.retryCount <= 3) {
            return await forwardToBackend(req, res, modelName);
          }
        }
      }
      
      // Forward the error response
      const errorData = await response.text();
      console.error(`Backend service responded with error: ${response.status} ${errorData}`);
      
      return res.status(response.status).send(errorData);
    }
    
    // Get the response body
    const data = await response.json();
    
    // Send the response back to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).json({
      success: false,
      error: `Failed to process request: ${error.message}`
    });
  }
}

/**
 * Forward a request to the logger service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - Promise that resolves when request is handled
 */
async function forwardToLogger(req, res) {
  try {
    // Build the target URL
    const targetUrl = `${LOGGER_URL}${req.originalUrl}`;
    
    console.log(`Forwarding log request to: ${targetUrl}`);
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    // Get the response body
    const data = await response.json();
    
    // Send the response back to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to logger:', error);
    res.status(500).json({
      success: false,
      error: `Failed to forward to logger: ${error.message}`
    });
  }
}

/**
 * Get all available models
 * GET /api/models
 */
app.get('/api/models', async (req, res) => {
  try {
    const cacheKey = 'all-models';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData.hit) {
      return res.json(cachedData.data);
    }
    
    const response = await fetch(`${REGISTRY_URL}/services`);
    
    if (!response.ok) {
      throw new Error(`Registry returned ${response.status}`);
    }
    
    const data = await response.json();
    const services = data.services || {};
    
    // Collect all unique model names
    const modelNames = new Set();
    
    // Extract all models from all healthy services
    Object.entries(services).forEach(([url, service]) => {
      if (service.healthStatus) {
        Object.keys(service.models || {}).forEach(modelName => {
          modelNames.add(modelName);
        });
      }
    });
    
    const result = {
      availableModels: Array.from(modelNames)
    };
    
    // Cache the result
    cache.set(cacheKey, result);
    
    return res.json(result);
  } catch (error) {
    console.error('Error getting all models:', error);
    res.status(500).json({
      success: false,
      error: `Failed to get models: ${error.message}`
    });
  }
});

/**
 * Get models by type
 * GET /api/models/types/:type
 */
app.get('/api/models/types/:type', async (req, res) => {
  try {
    const type = req.params.type;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: type'
      });
    }
    
    // Get models by type from registry
    const result = await serviceUtils.getModelsByType(type, cache);
    
    res.json(result);
  } catch (error) {
    console.error(`Error getting models for type ${req.params.type}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to get models: ${error.message}`
    });
  }
});

/**
 * Process chat request
 * POST /api/process/chat
 */
app.post('/api/process/chat', async (req, res) => {
  try {
    const modelName = req.body.modelName;
    
    if (!modelName) {
      return res.status(400).json({
        actor: 'system',
        content: 'Error: Model name must be specified in the request.',
        error: 'Missing model name'
      });
    }
    
    // Forward to appropriate backend
    await forwardToBackend(req, res, modelName);
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      actor: 'system',
      content: 'Error processing your request. Please try again.',
      error: error.message
    });
  }
});

/**
 * Process summarize request
 * POST /api/process/summarize
 */
app.post('/api/process/summarize', async (req, res) => {
  try {
    const modelName = req.body.modelName;
    
    if (!modelName) {
      return res.status(400).json({
        summary: 'Error: Model name must be specified in the request.',
        error: 'Missing model name'
      });
    }
    
    // Forward to appropriate backend
    await forwardToBackend(req, res, modelName);
  } catch (error) {
    console.error('Error processing summarize request:', error);
    res.status(500).json({
      summary: 'Error processing your request. Please try again.',
      error: error.message
    });
  }
});

/**
 * Handle log-related endpoints
 */
app.use('/api/logs', async (req, res) => {
  // Forward directly to logger service
  await forwardToLogger(req, res);
});

/**
 * Handle log-query endpoints
 */
app.use('/api/query', async (req, res) => {
  // Forward directly to logger service
  await forwardToLogger(req, res);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

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

