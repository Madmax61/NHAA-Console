import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function generateContentWithFallback(models, contents) {
  let lastError = null;
  for (const model of models) {
    console.log("Trying model:", model);
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response.text;
    } catch (e) {
      console.log("Error on", model, ":", e.message);
      lastError = e;
    }
  }
  throw lastError;
}
generateContentWithFallback(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'], 'Hello').then(console.log).catch(e => console.log("Final error:", e.message));
