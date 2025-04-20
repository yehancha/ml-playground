const BaseModel = require('./baseModel');

/**
 * AdvancedModel - A model that responds differently to greetings, farewells, and other messages
 */
class AdvancedModel extends BaseModel {
    
  greetingPatterns = [
    /\b(hi|hello|hey|greetings|howdy|hola|morning|afternoon|evening)\b/i
  ];
  
  farewellPatterns = [
    /\b(bye|goodbye|see ya|farewell|later|cya|adios)\b/i
  ];
  
  randomResponses = [
    "Why do you say '{message}'?",
    "I think you are right. {message}.",
    "That's interesting! {message}? Tell me more.",
    "Yes, I think that {message}.",
    "I'm not sure about '{message}', what do you think?",
    "Let me think about that... {message}... Interesting perspective!",
    "I've been considering '{message}' myself recently.",
    "'{message}' - that's a fascinating point."
  ];
  
  greetingResponses = [
    "Hello there! How can I help you today?",
    "Hi! Nice to meet you!",
    "Greetings! How are you doing?",
    "Hey! What's on your mind today?",
    "Hello! I'm the Advanced Model. What would you like to talk about?"
  ];
  
  farewellResponses = [
    "Goodbye! It was nice chatting with you.",
    "See you later! Have a great day.",
    "Farewell! Come back anytime.",
    "Bye for now! Take care.",
    "Until next time! Goodbye."
  ];
  
  constructor() {
    super('Advanced');
  }
  
  /**
   * Checks if a message contains a greeting
   * @param {string} message - The user message
   * @returns {boolean} - True if the message contains a greeting
   */
  isGreeting(message) {
    return this.greetingPatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * Checks if a message contains a farewell
   * @param {string} message - The user message
   * @returns {boolean} - True if the message contains a farewell
   */
  isFarewell(message) {
    return this.farewellPatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * Get a random response from an array
   * @param {Array} responses - The response array to select from
   * @returns {*} - A random response from the array
   */
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * Formats a response template with the user's message
   * @param {string} template - The response template
   * @param {string} message - The user message to insert
   * @returns {string} - The formatted response
   */
  formatResponse(template, message) {
    return template.replace('{message}', message);
  }

  /**
   * Generates a response based on the user message
   * @param {string} userMessage - The message from the user
   * @param {Array} conversationHistory - The conversation history (not used in this model)
   * @returns {Object} Response object with actor and content
   */
  async generateResponse(userMessage, conversationHistory) {
    let response;
    
    if (this.isGreeting(userMessage)) {
      response = this.getRandomResponse(this.greetingResponses);
    } else if (this.isFarewell(userMessage)) {
      response = this.getRandomResponse(this.farewellResponses);
    } else {
      const template = this.getRandomResponse(this.randomResponses);
      response = this.formatResponse(template, userMessage);
    }
    
    return {
      actor: 'model',
      content: response
    };
  }
}

module.exports = AdvancedModel;
