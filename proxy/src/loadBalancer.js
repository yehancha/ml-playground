/**
 * Load balancer for distributing requests across backend services
 */
class LoadBalancer {
  constructor() {
    // Service counters for round-robin selection
    this.serviceCounters = {};
    
    // Track failed services to avoid them temporarily
    this.failedServices = new Set();
  }

  /**
   * Get the next service URL to use from a list using round-robin strategy
   * @param {string} key - Key to identify the service group (e.g. model name)
   * @param {Array<string>} services - Array of service URLs
   * @returns {string|null} - Next service URL to use, or null if none available
   */
  getNextService(key, services) {
    if (!services || services.length === 0) {
      console.warn(`No services available for key: ${key}`);
      return null;
    }
    
    // Filter out any failed services
    const availableServices = services.filter(url => !this.failedServices.has(url));
    
    if (availableServices.length === 0) {
      console.warn(`All services for key ${key} are marked as failed`);
      
      // If all services are failed, try to recover failed one
      if (services.length > 0 && this.failedServices.length > 0) {
        const recoveredService = this.failedServices[0];
        console.log(`Attempting recovery of failed service: ${recoveredService}`);
        this.failedServices.delete(recoveredService);
        return recoveredService;
      }
      
      return null;
    }
    
    // Initialize counter for this key if it doesn't exist
    if (!this.serviceCounters[key]) {
      this.serviceCounters[key] = 0;
    }
    
    // Get the next index using round-robin
    const index = this.serviceCounters[key] % availableServices.length;
    
    // Increment the counter for next time
    this.serviceCounters[key]++;
    
    const selectedService = availableServices[index];
    
    return selectedService;
  }

  /**
   * Mark a service as failed
   * @param {string} url - Service URL to mark as failed
   */
  markServiceFailed(url) {
    if (!url) return;
    
    this.failedServices.add(url);
    console.warn(`Marked service as failed: ${url}`);
    
    // Set a timeout to recover the service after a delay
    setTimeout(() => {
      this.failedServices.delete(url);
      console.log(`Recovered failed service after pullback: ${url}`);
    }, 30000); // 30 second recovery time
  }

  /**
   * Reset the load balancer state
   */
  reset() {
    this.serviceCounters = {};
    this.failedServices.clear();
    console.log('LoadBalancer reset');
  }
}

module.exports = LoadBalancer;

