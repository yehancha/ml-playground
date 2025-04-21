module.exports.attach = (app, upstreamHandler) => {

  /**
   * Handle log-related endpoints
   */
  app.use('/api/logs', async (req, res) => {
    // Forward directly to logger service
    await upstreamHandler.forwardToLogger(req, res);
  });

  /**
   * Handle log-query endpoints
   */
  app.use('/api/query', async (req, res) => {
    // Forward directly to logger service
    await upstreamHandler.forwardToLogger(req, res);
  });
}