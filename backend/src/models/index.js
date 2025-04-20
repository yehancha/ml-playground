/**
 * Exports all model-related components for easier imports
 */

// Export individual classes
const BaseModel = require('./baseModel');
const EchoModel = require('./echoModel');
const AdvancedModel = require('./advancedModel');

// Export the model manager
const modelManager = require('./modelManager');

// Export the models configuration
const { MODELS, modelConfig } = require('../config/modelConfig');

module.exports = {
  BaseModel,
  EchoModel,
  AdvancedModel,
  modelManager,
  MODELS,
  modelConfig
};

