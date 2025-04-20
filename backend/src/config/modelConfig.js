/**
 * Model configuration
 * Provides configuration for the model system
 */

// Define known models
const MODELS = {
  ECHO: 'echo',
  ADVANCED: 'advanced'
};

// Parse available models from environment variable
function parseAvailableModels() {
  // Get models from environment variable or use all known models
  const envModels = process.env.AVAILABLE_MODELS;
  
  if (!envModels) {
    console.warn('No AVAILABLE_MODELS environment variable set, using all known models');
    return Object.values(MODELS);
  }
  
  // Parse comma-separated list
  const modelList = envModels.split(',')
    .map(model => model.trim().toLowerCase())
    .filter(model => Object.values(MODELS).includes(model));
  
  if (modelList.length === 0) {
    console.warn('No valid models found in AVAILABLE_MODELS, using all known models');
    return Object.values(MODELS);
  }
  
  return modelList;
}

// Configuration object
const modelConfig = {
  // List of available models from environment
  availableModels: parseAvailableModels(),
  
  // Model-specific configurations could be added here
  models: {
    [MODELS.ECHO]: {
      // Echo model specific config (if needed)
    },
    [MODELS.ADVANCED]: {
      // Advanced model specific config (if needed)
    }
  },
  
  /**
   * Validate that the specified model is available
   * @param {string} modelName - Name of the model to validate
   * @returns {object} - Result object with valid flag and modelName
   */
  validateModel: function(modelName) {
    if (!modelName) {
      console.warn('No model specified');
      return { 
        valid: false, 
        modelName: this.availableModels[0] || null, 
        error: 'No model specified' 
      };
    }
    
    const normalizedName = modelName.toLowerCase();
    
    if (!this.availableModels.includes(normalizedName)) {
      console.warn(`Invalid model "${modelName}" specified`);
      return { 
        valid: false, 
        modelName: this.availableModels[0] || null,
        error: `Invalid model: ${modelName}. Available models: ${this.availableModels.join(', ')}` 
      };
    }
    
    return { 
      valid: true, 
      modelName: normalizedName,
      error: null 
    };
  }
};

// Export the models enum and the configuration
module.exports = {
  MODELS,
  modelConfig
};

