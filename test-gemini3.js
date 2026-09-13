import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const token = process.env.GEMINI_KEY;
  
  const ai = new GoogleGenAI({ apiKey: token });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello'
    });
    console.log("SUCCESS:", response.text);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
