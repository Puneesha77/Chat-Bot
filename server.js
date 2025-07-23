import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load .env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5050;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env!");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ POST /sendMessage route implementation - PUT API ROUTES FIRST
app.post('/sendMessage', async (req, res) => {
  console.log('POST /sendMessage route hit!');
  try {
    const userMessage = req.body.message;
    
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    console.log("🔁 Gemini response:", text);

    res.json({ reply: text });
  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

// Serve frontend static files - PUT THIS AFTER API ROUTES
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📝 Registered routes:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  POST /sendMessage');
});