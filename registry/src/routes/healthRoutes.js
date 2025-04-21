module.exports.attach = app => {

  /**
   * Health endpoint for the registry itself
   * GET /health
   */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}
