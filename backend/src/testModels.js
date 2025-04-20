/**
 * Test script for the model architecture
 * Demonstrates how to use the ModelManager to generate responses from different models
 */

const { modelManager, MODELS } = require('./models');

/**
 * Simple function to format and print a model response
 */
function printResponse(modelName, userMessage, response) {
  console.log('\n-----------------------------------');
  console.log(`Model: ${modelName}`);
  console.log(`User: ${userMessage}`);
  console.log(`Response: ${response.content}`);
  console.log('-----------------------------------\n');
}

/**
 * Helper function to get a model instance by name
 * @param {string} modelName - Name of the model to get
 * @returns {Object} - The model instance or null if invalid
 */
function getModel(modelName) {
  const result = modelManager.getModelByName(modelName);
  
  if (!result.success) {
    console.error(`Error getting model "${modelName}": ${result.error}`);
    return null;
  }
  
  return result.model;
}

async function testModels() {
  console.log('Testing Model Architecture');
  console.log('=========================\n');
  
  // Get available models
  const availableModels = modelManager.getAvailableModels();
  console.log(`Available models: ${availableModels.join(', ')}\n`);
  
  // Test with a simple message across all models
  const testMessage1 = "Hello, this is a test message.";
  
  // Test the Echo model
  console.log('Testing the Echo model...');
  const echoModel = getModel(MODELS.ECHO);
  
  if (echoModel) {
    const response1 = await echoModel.generateResponse(testMessage1, []);
    printResponse(echoModel.getModelName(), testMessage1, response1);
  }
  
  // Test the Advanced model
  console.log('Testing the Advanced model...');
  const advancedModel = getModel(MODELS.ADVANCED);
  
  if (advancedModel) {
    const response2 = await advancedModel.generateResponse(testMessage1, []);
    printResponse(advancedModel.getModelName(), testMessage1, response2);
    
    // Test conversation with the Advanced model
    console.log('Testing conversation with the Advanced model...');
    const conversationHistory = [];
    
    // Test greeting
    const greeting = "Hi there!";
    const greetingResp = await advancedModel.generateResponse(greeting, conversationHistory);
    printResponse(advancedModel.getModelName(), greeting, greetingResp);
    conversationHistory.push({ actor: 'user', content: greeting });
    conversationHistory.push(greetingResp);
    
    // Test regular message
    const msg1 = "Tell me about artificial intelligence.";
    const resp1 = await advancedModel.generateResponse(msg1, conversationHistory);
    printResponse(advancedModel.getModelName(), msg1, resp1);
    conversationHistory.push({ actor: 'user', content: msg1 });
    conversationHistory.push(resp1);
    
    // Test another regular message
    const msg2 = "What are some applications of AI?";
    const resp2 = await advancedModel.generateResponse(msg2, conversationHistory);
    printResponse(advancedModel.getModelName(), msg2, resp2);
    conversationHistory.push({ actor: 'user', content: msg2 });
    conversationHistory.push(resp2);
    
    // Test farewell
    const farewell = "Goodbye!";
    const farewellResp = await advancedModel.generateResponse(farewell, conversationHistory);
    printResponse(advancedModel.getModelName(), farewell, farewellResp);
  }
  
  // Demonstrate how to handle an invalid model request
  console.log('\nTesting error handling for invalid model...');
  const invalidResult = modelManager.getModelByName('nonexistent-model');
  if (!invalidResult.success) {
    console.log(`Error handled correctly: ${invalidResult.error}`);
  }
  
  console.log('\nTest complete!');
}

testModels().catch(error => {
  console.error('Error running model tests:', error);
});

