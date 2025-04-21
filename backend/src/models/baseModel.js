/**
 * BaseModel - Abstract base class for all model implementations
 * Provides the interface that all model implementations must follow
 */
class BaseModel {

  /**
   * @param {string} modelType - Type of the mode. It will throw an error if the type is not a supported one.
   * @param {string} modelName - Name of the model. This will be used as the model identifier.
   */
  constructor(modelType, modelName) {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is an abstract class and cannot be instantiated directly.');
    }
    
    modelType = modelType.toLocaleUpperCase();
    if (!Object.values(BaseModel.types).includes(modelType)) {
      throw new Error(`Unsupported model type ${modelType} for model ${modelName}.`);
    }
    this.modelType = modelType;
    this.modelName = modelName;
  }

  /**
   * Returns the type of the model
   */
  getModelType() {
    return this.modelType;
  }

  /**
   * Returns the name of the model (identifier)
   */
  getModelName() {
    return this.modelName;
  }

  /**
   * Processes the input and produce an output
   * @param {Object} input - Input for the model
   * @returns {Object} Output from the model
   */
  async process(input) {
    throw new Error('process method must be implemented by subclasses');
  }
}

BaseModel.types = {
  CHAT: 'CHAT',
  SUMMARIZE: 'SUMMARIZE',
  GENERATE_IMAGE: 'GENERATE_IMAGE',
};

module.exports = BaseModel;

