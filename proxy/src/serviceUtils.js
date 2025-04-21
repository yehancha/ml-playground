
const REGISTRY_URL = process.env.REGISTRY_URL;

/**
 * Util class to manage cached services
 */
class ServiceUtils  {

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

      cacheInstance.set(cacheKey, serviceUrls);

      return serviceUrls;
    } catch (error) {
      console.error(`Error getting services for model ${modelName}:`, error);
      throw error;
    }
  }

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
      const response = await fetch(`${REGISTRY_URL}/services/types/${type}`);

      if (!response.ok) {
        throw new Error(`Registry returned ${response.status}`);
      }

      const data = await response.json();

      cacheInstance.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error(`Error getting models for type ${type}:`, error);
      throw error;
    }
  }
};

module.exports = ServiceUtils;
