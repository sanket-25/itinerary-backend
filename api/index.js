import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
      model: "gpt-4o", // Replace with the model you are using
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

// Export a default handler for Vercel
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

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
};
