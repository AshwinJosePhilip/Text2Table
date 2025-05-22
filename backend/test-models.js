require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // First, let's check if the API key is valid by listing available models
    console.log('Testing API key validity...');
    
    // Try to use the gemini-1.5-pro model instead
    console.log('Testing with gemini-1.5-pro model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate a simple response to test if the API key works
    const prompt = "Hello, what models are available in the Google Generative AI?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('API key is valid!');
    console.log('Response from model:', text);
    
  } catch (error) {
    console.error('Error testing Google Generative AI:');
    console.error(error);
    
    if (error.message && error.message.includes('API key')) {
      console.log('\nPossible issue: Your API key may be invalid or not properly set in the .env file.');
    } else if (error.status === 404) {
      console.log('\nPossible issue: The model name is incorrect or not available.');
      console.log('Try using one of these models: gemini-pro, gemini-pro-vision');
    }
  }
}

listModels();