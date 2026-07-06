import Groq from "groq-sdk";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

let groq = null;
function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GROQ_API_KEY is not defined in process.env!");
    }
    groq = new Groq({
      apiKey: apiKey || "dummy-key-for-load-time-safety",
    });
  }
  return groq;
}

export async function generateReply(message, model = "llama-3.3-70b-versatile") {
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are DeepGeet AI, a friendly anime-inspired AI assistant. Reply naturally in Hindi and English according to the user's language.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "❌ Groq AI se connect nahi ho paya. Thodi der baad try karo.";
  }
}