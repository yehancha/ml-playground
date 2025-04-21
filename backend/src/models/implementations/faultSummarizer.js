const BaseModel = require('../baseModel');

/**
 * A model that send the same wrong summary for any input.
 */
class FaultSummarizer extends BaseModel {

  constructor() {
    super(BaseModel.types.SUMMARIZE, 'Fault');
  }

  /**
   * Summarize the input text by removing words
   * @param {Object} input - Input containing originalText
   * @returns {Object} Response object with actor and summary
   */
  async process(input) {
    return {
      actor: 'model',
      summary: 'Always the summary is this.'
    };
  }
}

module.exports = FaultSummarizer;
