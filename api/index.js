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
async function getOpenAIResponse(coordinates, destination, budget, days) {
  try {
    const question = `I am at ${coordinates}. Plan me a ${days}-day trip to ${destination}. My budget is Rs.${budget} only. Give response in JSON format.`;

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a travel assistant who provides travel plans in JSON format." },
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

// Define an API endpoint for "Hello World"
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Define an API endpoint for /plan-trip
app.post('/plan-trip', async (req, res) => {
  const { coordinates, destination, budget, days } = req.body;

  if (!coordinates || !destination || !budget || !days) {
    return res.status(400).json({ error: "All fields (coordinates, destination, budget, days) are required." });
  }

  try {
    const tripPlan = await getOpenAIResponse(coordinates, destination, budget, days);
    // res.json({ tripPlan: JSON.parse(tripPlan) });
    res.json({tripPlan});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Set up the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
