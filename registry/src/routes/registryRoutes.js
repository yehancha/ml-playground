module.exports.attach = (app, registry) => {

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
}