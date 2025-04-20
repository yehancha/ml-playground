const { MODELS, modelConfig } = require('../config/modelConfig');
const EchoModel = require('./echoModel');
const AdvancedModel = require('./advancedModel');

/**
 * Factory class for creating and managing model instances
 */
class ModelManager {
  constructor() {
    this.modelInstances = {};
    console.log(`ModelManager initialized with available models: ${modelConfig.availableModels.join(', ')}`);
  }

  /**
   * Get a model instance by name
   * @param {string} modelName - Name of the model to get
   * @returns {Object} - Object containing either the model instance or an error
   */
  getModelByName(modelName) {
    const validationResult = modelConfig.validateModel(modelName);
    
    if (!validationResult.valid) {
      console.warn(`Invalid model requested: ${modelName}`);
      return {
        success: false,
        error: validationResult.error,
        model: null
      };
    }
    
    const validModelName = validationResult.modelName;
    
    if (!this.modelInstances[validModelName]) {
      try {
        this.modelInstances[validModelName] = this.createModelInstance(validModelName);
        console.log(`Created new instance of model: ${validModelName}`);
      } catch (error) {
        console.error(`Error creating model instance for ${validModelName}:`, error);
        return {
          success: false,
          error: `Error initializing model: ${error.message}`,
          model: null
        };
      }
    }
    
    return {
      success: true,
      error: null,
      model: this.modelInstances[validModelName]
    };
  }
  
  /**
   * Get the list of available models
   * @returns {Array} - Array of available model names
   */
  getAvailableModels() {
    return modelConfig.availableModels;
  }

  /**
   * Create a new model instance
   * @param {string} modelName - Name of the model to create
   * @returns {BaseModel} - A new instance of the requested model
   * @private
   */
  createModelInstance(modelName) {
    switch (modelName) {
      case MODELS.ECHO:
        return new EchoModel();
      case MODELS.ADVANCED:
        return new AdvancedModel();
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  }
}

const modelManager = new ModelManager();
module.exports = modelManager;
