/**
 * Service Registry for managing backend services
 */
class ServiceRegistry {
  constructor(healthCheckInterval = 30000) {
    // Main data structure to store services
    this.services = {};
    
    // Index services by model type for quick lookups
    this.typeIndex = {};
    
    // Index services by model name for quick lookups
    this.modelIndex = {};
    
    // Health check interval in milliseconds
    this.healthCheckInterval = healthCheckInterval;
    
    console.log(`ServiceRegistry initialized with health check interval: ${healthCheckInterval}ms`);
  }

  /**
   * Register a service with its supported models
   * @param {string} url - URL of the service
   * @param {Array} models - Array of models supported by the service
   * @returns {boolean} - Success status
   */
  registerService(url, models) {
    if (!url || !models || !Array.isArray(models)) {
      console.error('Invalid registration data', { url, models });
      return false;
    }

    console.log(`Registering service: ${url} with ${models.length} models`);
    
    // Create or update service entry
    this.services[url] = {
      url,
      lastHealthCheck: Date.now(),
      healthStatus: true,
      models: {}
    };

    // Process each model
    models.forEach(model => {
      // Skip invalid models
      if (!model.name || !model.type) {
        console.warn(`Skipping invalid model from ${url}:`, model);
        return;
      }

      // Add model to service
      this.services[url].models[model.name] = { type: model.type };

      // Add to type index
      if (!this.typeIndex[model.type]) {
        this.typeIndex[model.type] = [];
      }
      if (!this.typeIndex[model.type].includes(url)) {
        this.typeIndex[model.type].push(url);
      }

      // Add to model index
      if (!this.modelIndex[model.name]) {
        this.modelIndex[model.name] = [];
      }
      if (!this.modelIndex[model.name].includes(url)) {
        this.modelIndex[model.name].push(url);
      }
    });

    console.log(`Service registered: ${url}`);
    return true;
  }

  /**
   * Unregister a service
   * @param {string} url - URL of the service to unregister
   * @returns {boolean} - Success status
   */
  unregisterService(url) {
    if (!url || !this.services[url]) {
      console.warn(`Attempted to unregister non-existent service: ${url}`);
      return false;
    }

    console.log(`Unregistering service: ${url}`);
    
    // Get all models for this service
    const service = this.services[url];
    const modelNames = Object.keys(service.models);
    
    // Remove from type index
    modelNames.forEach(modelName => {
      const modelType = service.models[modelName].type;
      
      // Remove from type index
      if (this.typeIndex[modelType]) {
        this.typeIndex[modelType] = this.typeIndex[modelType].filter(svcUrl => svcUrl !== url);
        if (this.typeIndex[modelType].length === 0) {
          delete this.typeIndex[modelType];
        }
      }
      
      // Remove from model index
      if (this.modelIndex[modelName]) {
        this.modelIndex[modelName] = this.modelIndex[modelName].filter(svcUrl => svcUrl !== url);
        if (this.modelIndex[modelName].length === 0) {
          delete this.modelIndex[modelName];
        }
      }
    });
    
    // Remove service from registry
    delete this.services[url];
    
    console.log(`Service unregistered: ${url}`);
    return true;
  }

  /**
   * Get all registered services
   * @returns {Object} - Map of services with their details
   */
  getAllServices() {
    return this.services;
  }

  /**
   * Get services that support a specific model type
   * @param {string} type - Model type to filter by
   * @returns {Array} - List of model names of the specified type
   */
  getServicesByType(type) {
    if (!type || !this.typeIndex[type]) {
      return { availableModels: [] };
    }
    
    // Get all services supporting this type
    const services = this.typeIndex[type];
    
    // Collect all model names of this type across all services
    const modelNames = new Set();
    
    services.forEach(serviceUrl => {
      const service = this.services[serviceUrl];
      if (!service) return;
      
      // Add all models of the specified type
      Object.entries(service.models).forEach(([modelName, modelInfo]) => {
        if (modelInfo.type === type) {
          modelNames.add(modelName);
        }
      });
    });
    
    return {
      availableModels: Array.from(modelNames)
    };
  }

  /**
   * Get services by model name
   * @param {string} modelName - Name of the model
   * @returns {Array} - List of service URLs that support the model
   */
  getServicesByModel(modelName) {
    if (!modelName || !this.modelIndex[modelName]) {
      return [];
    }
    
    return this.modelIndex[modelName].filter(url => {
      return this.services[url] && this.services[url].healthStatus;
    });
  }

  /**
   * Update service health status
   * @param {string} url - URL of the service
   * @param {boolean} status - Health status
   */
  updateServiceHealth(url, status) {
    if (!this.services[url]) return;
    
    this.services[url].lastHealthCheck = Date.now();
    this.services[url].healthStatus = status;
    
    if (!status) {
      console.warn(`Service marked unhealthy: ${url}`);
    }
  }

  /**
   * Run health checks on all registered services
   * @returns {Promise<void>}
   */
  async runHealthChecks() {
    const serviceUrls = Object.keys(this.services);
    if (serviceUrls.length === 0) {
      console.log('No services to health check');
      return;
    }
    
    const checkPromises = serviceUrls.map(async (url) => {
      try {
        const healthUrl = `${url}/health`;
        const response = await fetch(healthUrl, { 
          method: 'GET',
          timeout: 3000 // 3 second timeout
        });
        
        if (response.ok) {
          this.updateServiceHealth(url, true);
          return true;
        } else {
          console.warn(`Health check failed for ${url}: ${response.status}`);
          this.updateServiceHealth(url, false);
          return false;
        }
      } catch (error) {
        console.error(`Health check error for ${url}:`, error.message);
        this.updateServiceHealth(url, false);
        return false;
      }
    });
    
    const results = await Promise.all(checkPromises);
    const failedCount = results.filter(result => !result).length;
    
    if (failedCount > 0) {
      console.warn(`${failedCount} services failed health checks`);
    } else {
      console.log(`All ${serviceUrls.length} services are healthy`);
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
    }
    
    this._healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch(error => {
        console.error('Error during health check run:', error);
      });
    }, this.healthCheckInterval);
    
    console.log(`Health checks scheduled every ${this.healthCheckInterval}ms`);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks() {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = null;
      console.log('Health checks stopped');
    }
  }
}

module.exports = ServiceRegistry;

