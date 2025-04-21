module.exports.attach = app => {

  /**
   * Health check endpoint
   */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}