const BaseModel = require('./baseModel');

/**
 * EchoModel - A simple model that echoes back the user's message
 */
class EchoModel extends BaseModel {

  constructor() {
    super('Echo');
  }

  /**
   * Generates a response by echoing back the user's message
   * @param {string} userMessage - The message from the user
   * @param {Array} conversationHistory - The conversation history (not used in this model)
   * @returns {Object} Response object with actor and content
   */
  async generateResponse(userMessage, conversationHistory) {
    return {
      actor: 'model',
      content: `You said: "${userMessage}" - Hello from the Echo Model!`
    };
  }
}

module.exports = EchoModel;
