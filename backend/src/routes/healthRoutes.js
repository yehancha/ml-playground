module.exports.attach = app => {

  /**
   * Health check endpoint
   * GET /health
   */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}