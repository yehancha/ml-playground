const ServiceUtils = require('./../serviceUtils');

const REGISTRY_URL = process.env.REGISTRY_URL;

const serviceUtils = new ServiceUtils();

module.exports.attach = (app, cache) => {

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
}