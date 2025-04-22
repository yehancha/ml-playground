/**
 * Cache service for storing registry responses with TTL
 */
class ServiceCache {
  constructor(defaultTtl = 5000) {
    // Main cache store
    this.cache = {};
    
    // Default Time-To-Live in milliseconds
    this.defaultTtl = Number(defaultTtl);
    
    console.log(`ServiceCache initialized with default TTL: ${defaultTtl}ms`);
  }

  /**
   * Store data in cache with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time-to-live in milliseconds (optional, uses default if not specified)
   */
  set(key, data, ttl = this.defaultTtl) {
    // Calculate expiration time
    const expiry = Date.now() + Number(ttl);
    
    // Store data with expiration
    this.cache[key] = {
      data,
      expiry
    };
    
    console.log(`Cached data for key "${key}" with TTL ${ttl}ms`, data);
  }

  /**
   * Retrieve data from cache if not expired
   * @param {string} key - Cache key
   * @returns {Object} - Object with retrieved data or null if expired/not found
   */
  get(key) {
    const entry = this.cache[key];
    
    // If entry doesn't exist or is expired
    if (!entry || entry.expiry < Date.now()) {
      if (entry) {
        console.log(`Cache entry for "${key}" has expired`);
        // Clean up expired entry
        delete this.cache[key];
      } else {
        console.log(`Cache miss for key "${key}"`);
      }
      
      return { 
        hit: false, 
        data: null 
      };
    }
    
    console.log(`Cache hit for key "${key}"`);
    return { 
      hit: true, 
      data: entry.data 
    };
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache = {};
    console.log('Cache cleared');
  }

  /**
   * Remove all expired entries from cache
   * @returns {number} - Number of entries removed
   */
  purgeExpired() {
    const now = Date.now();
    let count = 0;
    
    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].expiry < now) {
        delete this.cache[key];
        count++;
      }
    });
    
    if (count > 0) {
      console.log(`Purged ${count} expired cache entries`);
    }
    
    return count;
  }
}

module.exports = ServiceCache;

