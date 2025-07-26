import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables FIRST
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT || 5050;

console.log('🔍 Environment check:');
console.log('API_KEY exists:', !!API_KEY);
console.log('API_KEY length:', API_KEY ? API_KEY.length : 0);
console.log('PORT:', PORT);

if (!API_KEY) {
  console.error("❌ GOOGLE_API_KEY not found in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Test route - no external dependencies
app.post('/test', (req, res) => {
  console.log('🧪 Test route hit');
  console.log('Request body:', req.body);
  res.json({ 
    success: true, 
    message: 'Server is working',
    receivedMessage: req.body.message 
  });
});

// Health check
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    port: PORT,
    apiKeyConfigured: !!API_KEY
  });
});

// Chat route with comprehensive error handling
app.post('/chat', async (req, res) => {
  console.log('\n🎯 Chat route accessed');
  
  try {
    // Step 1: Check request body
    console.log('Step 1: Checking request body');
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    
    const userMessage = req.body?.message;
    console.log('Step 2: Extracted message:', userMessage);
    console.log('Message type:', typeof userMessage);
    
    if (!userMessage || typeof userMessage !== 'string') {
      console.log('❌ Invalid message');
      return res.status(400).json({ error: "Valid message is required" });
    }

    // Step 3: Check API key
    console.log('Step 3: Checking API key');
    if (!API_KEY) {
      console.log('❌ No API key found');
      return res.status(500).json({ error: "API key not configured" });
    }
    console.log('✅ API key is configured');

    // Step 4: Get model - try multiple model names
    console.log('Step 4: Getting model');
    let model;
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ];
    
    let modelError = null;
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Model obtained: ${modelName}`);
        break;
      } catch (modelErr) {
        console.log(`❌ Failed to get ${modelName}:`, modelErr.message);
        modelError = modelErr;
        continue;
      }
    }
    
    if (!model) {
      console.log('❌ Failed to get any model');
      return res.status(500).json({ 
        error: "Failed to get AI model. Last error: " + (modelError?.message || 'Unknown error')
      });
    }

    // Step 5: Generate content
    console.log('Step 5: Generating content for:', userMessage);
    let result;
    try {
      result = await model.generateContent(userMessage);
      console.log('✅ Content generated');
    } catch (genErr) {
      console.log('❌ Failed to generate content:', genErr.message);
      console.log('Error details:', genErr);
      
      // Check for specific error types
      if (genErr.message.includes('API_KEY')) {
        return res.status(500).json({ error: "API Key authentication failed" });
      }
      if (genErr.message.includes('quota') || genErr.message.includes('limit')) {
        return res.status(500).json({ error: "API quota exceeded. Please check your Google AI Studio quota." });
      }
      if (genErr.message.includes('SAFETY')) {
        return res.status(400).json({ error: "Content was blocked by safety filters. Please try a different message." });
      }
      
      return res.status(500).json({ error: "Failed to generate content: " + genErr.message });
    }

    // Step 6: Get response
    console.log('Step 6: Getting response');
    let response;
    try {
      response = await result.response;
      console.log('✅ Response obtained');
    } catch (respErr) {
      console.log('❌ Failed to get response:', respErr.message);
      return res.status(500).json({ error: "Failed to get response: " + respErr.message });
    }

    // Step 7: Extract text
    console.log('Step 7: Extracting text');
    let text;
    try {
      text = response.text();
      console.log('✅ Text extracted, length:', text.length);
      
      // LOG THE FULL AI RESPONSE TO CONSOLE
      console.log('\n' + '='.repeat(60));
      console.log('🤖 AI RESPONSE:');
      console.log('='.repeat(60));
      console.log(text);
      console.log('='.repeat(60) + '\n');
      
    } catch (textErr) {
      console.log('❌ Failed to extract text:', textErr.message);
      return res.status(500).json({ error: "Failed to extract text: " + textErr.message });
    }

    // Step 8: Send response
    console.log('Step 8: Sending response to client');
    res.json({ reply: text });
    console.log('✅ Response sent successfully');

  } catch (err) {
    console.log('\n❌ Unexpected error in chat route:');
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    console.log('Error stack:', err.stack);
    
    res.status(500).json({ 
      error: "Unexpected server error",
      details: err.message,
      type: err.name
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  const filePath = path.resolve(__dirname, 'public', 'chat.html');
  console.log('Serving chat.html from:', filePath);
  res.sendFile(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Available routes:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/test`);
  console.log(`   POST http://localhost:${PORT}/chat`);
  console.log(`\n🔧 Test commands:`);
  console.log(`   Health: Invoke-RestMethod -Uri "http://localhost:${PORT}/health"`);
  console.log(`   Test:   Invoke-RestMethod -Uri "http://localhost:${PORT}/test" -Method POST -ContentType "application/json" -Body '{"message":"hello"}'`);
  console.log(`   Chat:   Invoke-RestMethod -Uri "http://localhost:${PORT}/chat" -Method POST -ContentType "application/json" -Body '{"message":"hello"}'`);
});