import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "StatBot Pro"
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",  // IMPORTANT
      messages,
      temperature: 0.3
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    res.status(500).send("AI error");
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001 (OpenRouter)");
});