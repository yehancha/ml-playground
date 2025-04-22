# Model Architecture

The system is designed to allow multiple model implementations that can be automatically discovered and used at runtime.

## Overview

The model architecture consists of the following components:

- **BaseModel**: An abstract base class that defines the interface all models must implement
- **Model Implementations**: Sample concrete model classes that extend BaseModel, stored in the implementations directory
- **ModelManager**: A factory/manager class that handles automatic model discovery and instantiation

## Directory Structure

```
models                     # All the deployed models
├── baseModel.js           # Abstract model. All the models extend from this
├── implementations
│   ├── advancedModel.js   # Sample simple model in single file
│   ├── complexModel       # Sample complex model with its own directory
│   │   ├── index.js
│   │   └── utils.js
│   ├── ...
└── modelManager.js        # Handles model discovery at startup
```

## How It Works

1. The `baseModel.js` defines the interface that all models must implement
2. Model implementations are stored in the `implementations/` directory, either as individual files or as directories with an index.js entry point
3. The `modelManager.js` automatically discovers all models in the implementations directory at startup
4. Models are identified by the name returned from their `getModelName()` method
5. The ModelManager can optionally filter available models based on the AVAILABLE_MODELS environment variable
6. The server routes API requests to the requested model via the ModelManager

## Adding New Models

To add a new model to the system:

1. **For simple models**: Create a new file in the `implementations/` directory (e.g., `implementations/yourNewModel.js`)
2. **For complex models**: Create a new directory in `implementations/` with an `index.js` file (e.g., `implementations/yourComplexModel/index.js`)
3. Extend the BaseModel class and implement required methods:

```javascript
const BaseModel = require('../baseModel');  // Adjust path as needed

class YourNewModel extends BaseModel {
  constructor() {
    super(BasrModel.types.YOUR_MODEL_TYPE, 'YourNewModel'); // The second param identifies your model uniquely
    // Initialize any model-specific state
  }

  async process(input) {
    // Implement your model's response generation logic
    return {
      actor: 'model',
      content: 'Your model response here'
    };
  }
}

module.exports = YourNewModel;
```

That's it! The ModelManager will automatically discover and make available your new model on the next server startup. No additional configuration or code changes are required.

## Configuration

Models are automatically discovered, but you can control which ones are available through the environment:

### AVAILABLE_MODELS

To restrict which models are available, set the `AVAILABLE_MODELS` environment variable to a comma-separated list of model names:

```
AVAILABLE_MODELS=echo,advanced
```

If this variable is not set, all discovered models will be available.

## Forwarding Requests

The server handles model selection based on the client's request, automatically routing to the appropriate model implementation according to the defined model in the request.
