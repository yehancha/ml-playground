const BaseModel = require('../baseModel');

/**
 * EchoModel - A simple model that echoes back the user's message
 */
class EchoModel extends BaseModel {

  constructor() {
    super(BaseModel.types.CHAT, 'Echo');
  }

  /**
   * Generates a response based on the user message
   * @param {Object} input - Input containing userMessage and conversationHistory
   * @returns {Object} Response object with actor and content
   */
  async process(input) {
    const { userMessage, conversationHistory } = input;
    return {
      actor: 'model',
      content: `You said: "${userMessage}" - Hello from the Echo Model!`
    };
  }
}

module.exports = EchoModel;
