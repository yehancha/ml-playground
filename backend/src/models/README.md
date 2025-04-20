# Model Architecture

This directory contains the model architecture for the LLM Playground backend. The system is designed to allow multiple model implementations that can be swapped at runtime.

## Overview

The model architecture consists of the following components:

- **BaseModel**: An abstract base class that defines the interface all models must implement
- **Model Implementations**: Concrete model classes that extend BaseModel
- **ModelManager**: A factory/manager class that handles model selection and instantiation
- **Configuration**: Settings that control which model is active

## Directory Structure

```
models/
├── README.md              # This documentation
├── baseModel.js           # Abstract base class for all models
├── echoModel.js           # Simple echo model implementation
├── advancedModel.js       # Advanced model with conversation state
├── modelManager.js        # Factory/manager for model instances
└── index.js               # Exports all model components
```

## How It Works

1. The `baseModel.js` defines the interface that all models must implement
2. Concrete model implementations extend BaseModel and provide specific behavior
3. The `modelManager.js` handles model instantiation and selection
4. The server routes API requests to the active model via the ModelManager

## Adding New Models

To add a new model to the system:

1. Create a new file `yourNewModel.js` in the models directory
2. Extend the BaseModel class and implement required methods:

```javascript
const BaseModel = require('./baseModel');

class YourNewModel extends BaseModel {
  constructor() {
    super('YourNewModel');
    // Initialize any model-specific state
  }

  async generateResponse(userMessage, conversationHistory) {
    // Implement your model's response generation logic
    return {
      actor: 'model',
      content: 'Your model response here'
    };
  }
}

module.exports = YourNewModel;
```

3. Add your model to the available models in `../config/modelConfig.js`:

```javascript
const MODELS = {
  ECHO: 'echo',
  ADVANCED: 'advanced',
  YOUR_NEW_MODEL: 'yournewmodel'
};
```

4. Update the ModelManager to create instances of your model:

```javascript
// In _createModelInstance method in modelManager.js
switch (modelName) {
  case MODELS.ECHO:
    return new EchoModel();
  case MODELS.ADVANCED:
    return new AdvancedModel();
  case MODELS.YOUR_NEW_MODEL:
    return new YourNewModel();
  default:
    console.warn(`Unknown model ${modelName}, falling back to default model`);
    return new EchoModel();
}
```

5. Export your model in the index.js file:

```javascript
const YourNewModel = require('./yourNewModel');

module.exports = {
  // ... existing exports
  YourNewModel,
};
```

## Configuration

Models are configured through the `../config/modelConfig.js` file. The default model can be set using the `DEFAULT_MODEL` environment variable.

## API Usage

The API uses the ModelManager to get responses from the active model:

```javascript
const modelManager = require('./models/modelManager');

// Get the active model
const activeModel = modelManager.getActiveModel();

// Generate a response
const response = await activeModel.generateResponse(userMessage, conversationHistory);
```

You can also switch models at runtime:

```javascript
// Switch to a different model
modelManager.setActiveModel('advanced');
```

