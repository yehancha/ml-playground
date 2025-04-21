const { GoogleGenAI } = require("@google/genai");
const BaseModel = require('../baseModel');

/**
 * A sample model that uses GoogleGenAI
 */
class GenAiModel extends BaseModel {
  model = "gemini-2.0-flash";
  ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

  constructor() {
    super(BaseModel.types.CHAT, 'GenAi');
  }

  /**
   * Generates a response based on the user message
   * @param {Object} input - Input containing userMessage and conversationHistory
   * @returns {Object} Response object with actor and content
   */
  async process(input) {
    const { userMessage, conversationHistory } = input;
    let content = '';

    try {
      const chat = this.ai.chats.create({
        model: this.model,
        history: this.convertConversationHistory(conversationHistory),
      });

      const response = await chat.sendMessage({
        message: userMessage,
      });

      content = response.text;
    } catch(error) {
      console.error('An error occurred while using GoogleGenAi.', error);
      content = 'Sorry, I cannot process your input at this time.';
    }

    return {
      actor: 'model',
      content
    };
  }

  convertConversationHistory(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return [];
    }
  
    // Exclude the last element since it is the next message to send
    const historyWithoutLast = conversationHistory.slice(0, -1);
  
    return historyWithoutLast.map(item => {
      return {
        role: item.actor,
        parts: [{ text: item.content }],
      };
    });
  }
}

module.exports = GenAiModel;
