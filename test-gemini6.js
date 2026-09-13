import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
async function run() {
  const ai = new GoogleGenAI({});
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
