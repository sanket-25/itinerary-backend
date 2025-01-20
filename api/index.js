// api/index.js
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

async function getOpenAIResponse(question) {
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "JSON" },
        { role: "user", content: question }
      ],
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
    });
    
    return response.choices[0].message.content;
  } catch (err) {
    console.error("Error interacting with OpenAI API:", err);
    throw new Error("Failed to get response from OpenAI API.");
  }
}

app.get('/', (req, res) => {
  res.send('Hello VoyageHack');
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }
  
  try {
    const answer = await getOpenAIResponse(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the Express API
export default app;