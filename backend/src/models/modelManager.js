const fs = require('fs');
const path = require('path');

/**
 * Discovers and manges model implementations.
 */
class ModelManager {
  constructor() {
    this.modelInstances = {};
    this.modelClasses = {};
    this.availableModels = [];
    this.discoveredModels = [];
    
    // Discover and load all model implementations
    this.discoverModels();
    
    // Apply environment variable filtering after discovering models
    this.filterModelsByEnvironment();
    
    console.log(`ModelManager initialized with available models: ${this.availableModels.join(', ')}`);
  }

  /**
   * Discover all models in the implementations directory
   */
  discoverModels() {
    const implementationsDir = path.join(__dirname, 'implementations');
    
    // Create the directory if it doesn't exist.
    // This is not a possibility since we already have sample implementations but just in case.
    if (!fs.existsSync(implementationsDir)) {
      fs.mkdirSync(implementationsDir);
      console.log('Created implementations directory');
      return;
    }
    
    const entries = fs.readdirSync(implementationsDir, { withFileTypes: true });
    
    const discoveredModels = [];
    
    for (const entry of entries) {
      const entryPath = path.join(implementationsDir, entry.name);
      
      try {
        let ModelClass;
        
        if (entry.isDirectory()) {
          // For directories, look for index.js as the entry point
          const indexPath = path.join(entryPath, 'index.js');
          if (fs.existsSync(indexPath)) {
            ModelClass = require(indexPath);
          } else {
            console.warn(`Skipping directory ${entry.name}: no index.js found`);
            continue;
          }
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          // For files, just require them directly
          ModelClass = require(entryPath);
        } else {
          // Skip non-js files
          continue;
        }
        
        // Create a temporary instance to get the model name
        if (typeof ModelClass === 'function') {
          const tempInstance = new ModelClass();
          if (typeof tempInstance.getModelName === 'function' || typeof tempInstance.getModelType === 'function') {
            const modelName = tempInstance.getModelName().toLowerCase();
            const modelType = tempInstance.getModelType();
            
            // Store the model class
            this.modelClasses[modelName] = ModelClass;
            discoveredModels.push({
              type: modelType,
              name: modelName,
            });
            
            console.log(`Discovered model: ${modelName} from ${entry.name}`);
          } else {
            console.warn(`Skipping ${entry.name}: missing getModelName() or getModelType() method.`);
          }
        } else {
          console.warn(`Skipping ${entry.name}: not a valid model class`);
        }
      } catch (error) {
        console.error(`Error loading model from ${entry.name}:`, error);
      }
    }
    
    this.discoveredModels = discoveredModels;
  }
  
  /**
   * Filter available models based on AVAILABLE_MODELS environment variable
   */
  filterModelsByEnvironment() {
    const whitelist = process.env.AVAILABLE_MODELS;
    
    if (!whitelist) {
      // No environment restriction, use all discovered models
      this.availableModels = [...this.discoveredModels];
      console.log('No AVAILABLE_MODELS environment variable set, using all discovered models');
      return;
    }
    
    const allowedModels = whitelist.split(',')
      .map(model => model.trim().toLowerCase())
      .filter(Boolean);
    
    // Filter discovered models to only include those in the allowed list
    this.availableModels = this.discoveredModels.filter(model => 
      allowedModels.includes(model.name)
    );
    
    if (this.availableModels.length === 0) {
      console.warn(`No models matched between discovered models and AVAILABLE_MODELS environment variable`);
      console.warn(`Discovered: ${this.discoveredModels.map(model => model.name).join(', ')}`);
      console.warn(`Allowed: ${allowedModels.join(', ')}`);
    } else {
      console.log(`Filtered models based on AVAILABLE_MODELS environment variable`);
      console.log(`Available models: ${this.availableModels.map(model => model.name).join(', ')}`);
    }
  }

  /**
   * Get a model instance by name
   * @param {string} modelName - Name of the model to get
   * @returns {Object} - Object containing either the model instance or an error
   */
  getModelByName(modelName) {
    if (!modelName) {
      return {
        success: false,
        error: 'No model specified',
        model: null
      };
    }
    
    const normalizedName = modelName.toLowerCase();
    
    if (!this.availableModels.map(model => model.name).includes(normalizedName)) {
      return {
        success: false,
        error: `Invalid model: ${modelName}. Available models: ${this.availableModels.join(', ')}`,
        model: null
      };
    }
    
    if (!this.modelInstances[normalizedName]) {
      try {
        this.modelInstances[normalizedName] = this.createModelInstance(normalizedName);
        console.log(`Created new instance of model: ${normalizedName}`);
      } catch (error) {
        console.error(`Error creating model instance for ${normalizedName}:`, error);
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
      model: this.modelInstances[normalizedName]
    };
  }
  
  /**
   * Get the list of available models
   * @returns {Array} - Array of available model names
   */
  getAvailableModels() {
    return this.availableModels.map(model => model.name);
  }
  
  /**
   * Get the list of models for type
   * @param {string} type - Type of the models to return 
   * @returns {Array} - Array of available model names
   */
  getAvailableModelsByType(type) {
    return this.availableModels.filter(model => model.type === type).map(model => model.name);
  }

  /**
   * Create a new model instance
   * @param {string} modelName - Name of the model to create
   * @returns {BaseModel} - A new instance of the requested model
   */
  createModelInstance(modelName) {
    const ModelClass = this.modelClasses[modelName];
    
    if (!ModelClass) {
      throw new Error(`Model class not found for: ${modelName}`);
    }
    
    return new ModelClass();
  }
}

const modelManager = new ModelManager();
module.exports = modelManager;
