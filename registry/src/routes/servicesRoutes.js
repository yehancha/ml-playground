module.exports.attach = (app, registry) => {

  /**
   * Get all registered services
   * GET /services
   */
  app.get('/services', (req, res) => {
    const services = registry.getAllServices();

    res.status(200).json({
      success: true,
      services: services
    });
  });

  /**
   * Get services by type
   * GET /services/types/:type
   */
  app.get('/services/types/:type', (req, res) => {
    const type = req.params.type;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: type'
      });
    }

    const result = registry.getServicesByType(type);

    res.status(200).json(result);
  });
}