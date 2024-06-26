const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You are Kshitiz, a friendly assistant who works for Bharat Heavy Electricals Limited corporation ,India .  Answer user's questions related to Bharat Heavy Electricals Limited corporation and try  to churn out the most user-friendly answers without any special symbols like * ./**` etc. and in a very uniform, organized manner . There should be no special symbols in the code strictly , only alphabets,links and numbers should be allowed in response.Don't answer any questions other than questions which center around information about BHEL."}],
      },
      {
        role: "model",
        parts: [{ text: "Hello! I'm Kshitiz, your friendly assistant from Bharat Heavy Electricals Limited (BHEL). I'm here to help you with any questions you may have about our company. Just ask away, and I'll do my best to provide you with clear and concise information."}],
      },
      {
        role: "user",
        parts: [{ text: "Hi"}],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! How can I help you today? "}],
      },
      {role:"user",
        parts:[{text:'Can I ask questions other than those about BHEL ?'}]

      },
      {
        role:"model",
        parts:[{text:"I'm happy to help you with questions about BHEL, but I'm designed to be a BHEL-specific assistant. Let's focus on BHEL for now - what would you like to know? 😊 "}]
      }
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});