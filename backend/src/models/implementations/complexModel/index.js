const BaseModel = require('../../baseModel');
const utils = require('./utils');

/**
 * An example of a folder-based model with more complex implementation
 */
class ComplexModel extends BaseModel {
  examples = [
    "This is a complex model in its own directory",
    "It has access to utilities and resources in the same folder",
    "It's automatically discovered by the modelManager"
  ];

  constructor() {
    super(BaseModel.types.CHAT, 'Complex');
  }

  /**
   * Generates a response based on the user message
   * @param {Object} input - Input containing userMessage and conversationHistory
   * @returns {Object} Response object with actor and content
   */
  async process(input) {
    const { userMessage, conversationHistory } = input;
    const processedMessage = utils.process(userMessage, conversationHistory);
    const randomExample = this.examples[Math.floor(Math.random() * this.examples.length)];
    
    return {
      actor: 'model',
      content: `Complex model processing: ${processedMessage}\n\n${randomExample}`
    };
  }
}

module.exports = ComplexModel;
