module.exports.attach = (app, modelManager) => {
  
  /**
   * Prompts a given model with a user message and conversation history
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

      const modelResult = modelManager.getModelByName(modelName);

      if (!modelResult.success) {
        return res.status(400).json({
          actor: 'system',
          content: `Error: ${modelResult.error}`,
          error: modelResult.error
        });
      }

      const response = await modelResult.model.process(req.body);
      res.json(response);
    } catch (error) {
      console.error('Error processing prompt:', error);
      res.status(500).json({
        actor: 'model',
        content: 'Error processing your request.',
        error: 'Error processing your request.'
      });
    }
  });

  /**
   * Prompts a given model with a original text and summarize it
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

      const modelResult = modelManager.getModelByName(modelName);

      if (!modelResult.success) {
        return res.status(400).json({
          summary: `Error: ${modelResult.error}`,
          error: modelResult.error
        });
      }

      const response = await modelResult.model.process(req.body);
      res.json(response);
    } catch (error) {
      console.error('Error processing prompt:', error);
      res.status(500).json({
        summary: 'Error processing your request. Please try again.'
      });
    }
  });

  /**
   * Get available models
   */
  app.get('/api/models', (req, res) => {
    try {
      const availableModels = modelManager.getAvailableModels();
      res.json({
        availableModels: availableModels
      });
    } catch (error) {
      console.error('Error getting models:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving models'
      });
    }
  });

  /**
   * Get available models by type
   */
  app.get('/api/models/types/:type', (req, res) => {
    try {
      const availableModels = modelManager.getAvailableModelsByType(req.params.type);
      res.json({
        availableModels: availableModels
      });
    } catch (error) {
      console.error('Error getting models:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving models'
      });
    }
  });
}