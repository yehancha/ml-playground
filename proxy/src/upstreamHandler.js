const LoadBalancer = require('./loadBalancer');
const ServiceUtils = require('./serviceUtils');

const LOGGER_URL = process.env.LOGGER_URL;
const loadBalancer = new LoadBalancer();

class UpstreamHandler {
  serviceUtils = new ServiceUtils();
  cache;

  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Forward a request to the appropriate backend service
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} modelName - Model name to use
   * @returns {Promise} - Promise that resolves when request is handled
   */
  async forwardToBackend(req, res, modelName) {
    try {
      // Get available services for the model
      const services = await this.serviceUtils.getServicesForModel(modelName, this.cache);

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
  async forwardToLogger(req, res) {
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

}

module.exports = UpstreamHandler;
