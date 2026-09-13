import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const geminiApiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
  console.log("Key length:", geminiApiKey ? geminiApiKey.length : "None");
  console.log("Key prefix:", geminiApiKey ? geminiApiKey.substring(0, 4) : "");
  
  const ai = new GoogleGenAI({ 
    apiKey: geminiApiKey, 
    httpOptions: { 
      timeout: 60000,
      headers: { 'User-Agent': 'aistudio-build' }
    } 
  });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Hello'
    });
    console.log("SUCCESS:", response.text);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
