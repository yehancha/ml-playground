const express = require('express');
const cors = require('cors');
const modelManager = require('./src/models/modelManager');
const app = express();
const port = 3010;

const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

app.use((req, res, next) => {
  const startTime = new Date();
  const originalSend = res.send;

  res.send = function(body) {
    try {
      const logData = {
        timestamp: startTime.getTime(),
        endpoint: req.originalUrl,
        input: req.body,
        model: req.body.modelName,
        output: body,
        responseTimeMs: new Date() - startTime,
      };

      fetch(`${process.env.LOGGER_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      }).then(response => {
        if (!response.ok) {
          console.error('Error sending log to logging service.', response.status);
        }
      });
    } catch (error) {
      console.error('Error sending log:', error);
    } finally {
      originalSend.call(this, body);
    }
  };

  next();
});

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
    
    const model = modelResult.model;
    console.log(`Using model: ${model.getModelName()}`);
    
    const response = await model.process(req.body);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({
      actor: 'model',
      content: 'Error processing your request. Please try again.'
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
    
    const model = modelResult.model;
    console.log(`Using model: ${model.getModelName()}`);
    
    const response = await model.process(req.body);
    
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
 * Get available models for type
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

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log(`Available models: ${modelManager.getAvailableModels().join(', ')}`);
});
