import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.list(); // no method list? let's try calling REST API
  } catch(e) { console.error(e) }
}
run();
