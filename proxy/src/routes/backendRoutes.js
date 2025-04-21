module.exports.attach = (app, upstreamHandler) => {

  /**
   * Process chat request
   * POST /api/process/chat
   */
  app.post('/api/process/chat', async (req, res) => {
    try {
      const modelName = req.body.modelName;

      if (!modelName) {
        return res.status(400).json({
          actor: 'system',
          content: 'Error: Model name must be specified in the request.',
          error: 'Missing model name'
        });
      }

      // Forward to appropriate backend
      await upstreamHandler.forwardToBackend(req, res, modelName);
    } catch (error) {
      console.error('Error processing chat request:', error);
      res.status(500).json({
        actor: 'system',
        content: 'Error processing your request. Please try again.',
        error: error.message
      });
    }
  });

  /**
   * Process summarize request
   * POST /api/process/summarize
   */
  app.post('/api/process/summarize', async (req, res) => {
    try {
      const modelName = req.body.modelName;

      if (!modelName) {
        return res.status(400).json({
          summary: 'Error: Model name must be specified in the request.',
          error: 'Missing model name'
        });
      }

      // Forward to appropriate backend
      await upstreamHandler.forwardToBackend(req, res, modelName);
    } catch (error) {
      console.error('Error processing summarize request:', error);
      res.status(500).json({
        summary: 'Error processing your request. Please try again.',
        error: error.message
      });
    }
  });
}