/**
 * BaseModel - Abstract base class for all model implementations
 * Provides the interface that all model implementations must follow
 */
class BaseModel {
  /**
   * @param {string} modelName - Name of the model. This will be used as the model identifier.
   */
  constructor(modelName) {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is an abstract class and cannot be instantiated directly');
    }
    this.modelName = modelName;
  }

  /**
   * Returns the name of the model (identifier)
   */
  getModelName() {
    return this.modelName;
  }

  /**
   * Generate a response based on the user message and conversation history
   * @param {string} userMessage - The message from the user
   * @param {Array} conversationHistory - The conversation history
   * @returns {Object} Response object with actor and content
   */
  async generateResponse(userMessage, conversationHistory) {
    throw new Error('generateResponse method must be implemented by subclasses');
  }
}

module.exports = BaseModel;

