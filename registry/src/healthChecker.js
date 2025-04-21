class HealthChecker {
  serviceRegistry;
  healthCheckInterval;

  constructor(serviceRegistry, healthCheckInterval) {
    this.serviceRegistry = serviceRegistry;
    this.healthCheckInterval = healthCheckInterval;
  }

  /**
   * Run health checks on all registered services
   * @returns {Promise<void>}
   */
  async runHealthChecks() {
    const serviceUrls = Object.keys(this.serviceRegistry.services);
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
          this.serviceRegistry.updateServiceHealth(url, true);
          return true;
        } else {
          console.warn(`Health check failed for ${url}: ${response.status}`);
          this.serviceRegistry.updateServiceHealth(url, false);
          return false;
        }
      } catch (error) {
        console.error(`Health check error for ${url}:`, error.message);
        this.serviceRegistry.updateServiceHealth(url, false);
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
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
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
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('Health checks stopped');
    }
  }
}

module.exports = HealthChecker;
