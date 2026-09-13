import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
async function testKey(keyName, keyVal) {
  const ai = new GoogleGenAI({ apiKey: keyVal });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Hello'
    });
    console.log(keyName, "SUCCESS:", response.text);
  } catch (e) {
    console.log(keyName, "ERROR:", e.message);
  }
}
async function run() {
  await testKey('GEMINI_KEY', process.env.GEMINI_KEY);
  await testKey('GEMINI_API_KEY', process.env.GEMINI_API_KEY);
}
run();
