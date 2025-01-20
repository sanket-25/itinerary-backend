import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Your GitHub Personal Access Token
const token = process.env["GITHUB_TOKEN"];

// Set up OpenAI client
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

// Define the main function for interacting with OpenAI API
async function getOpenAIResponse(question) {
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "JSON" },
        { role: "user", content: question }
      ],
      model: "gpt-4o",  // Replace with the model you are using
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

// Define an API endpoint
app.post('/ask', async (req, res) => {
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

// Set up the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
