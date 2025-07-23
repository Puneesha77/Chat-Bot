import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
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
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// ✅ POST /chat route implementation
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
