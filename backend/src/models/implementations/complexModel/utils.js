/**
 * Utility functions for the complex model
 */

/**
 * Do some mock complex task and generate a response
 * @param {string} text - Input text
 * @param {Array} conversationHistory - Conversation history
 * @returns {string} - Processed text
 */
function process(text, conversationHistory) {
  const userMsgCount = conversationHistory.filter(msg => msg.actor === 'user').length;
  return `With >> ${text.toUpperCase()} <<, you have sent ${userMsgCount} messages so far.`;
}

module.exports = {
  process
};

