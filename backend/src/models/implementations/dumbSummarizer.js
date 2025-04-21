const BaseModel = require('../baseModel');

/**
 * A simple dumb model that summarize text by removing words.
 */
class DumbSummarizer extends BaseModel {

  constructor() {
    super(BaseModel.types.SUMMARIZE, 'Dumb');
  }

  /**
   * Summarize the input text by removing words
   * @param {Object} input - Input containing originalText
   * @returns {Object} Response object with actor and summary
   */
  async process(input) {
    const words = input.originalText.split(/\s+/).filter(word => word !== '');

    const result = [];
    for (let i = 0; i < words.length; i++) {
      if ((i + 1) % 3 !== 0) {
        result.push(words[i]);
      }
    }

    return {
      actor: 'model',
      summary: result.join(' ')
    };
  }
}

module.exports = DumbSummarizer;
