// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Load environment variables from .env (must be before using them!)
dotenv.config();

const PORT = process.env.PORT || 5050;
const API_KEY = process.env.GEMINI_API_KEY;

// ✅ Debugging: Make sure the key is loaded correctly
console.log("Loaded KEY:", API_KEY ? "✅ API Key found" : "❌ No API Key");

if (!API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY not found in .env!");
  process.exit(1); // Stop server if key not loaded
}

const app = express();

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/chat', async (req, res) => {
  try {
    console.log("Received chat request:", req.body);
    
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // ✅ Actual Gemini API call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    console.log("Gemini response:", reply);
    
    res.json({ reply: reply });
    
  } catch (err) {
    console.error("Error in /chat:", err);
    
    // Send more detailed error info for debugging
    if (err.message.includes('API_KEY')) {
      res.status(401).json({ error: "Invalid API key" });
    } else if (err.message.includes('quota')) {
      res.status(429).json({ error: "API quota exceeded" });
    } else {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});