import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const token = process.env.GEMINI_KEY;
  console.log("Token:", token.substring(0, 4));
  
  const ai = new GoogleGenAI({ 
    httpOptions: { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'aistudio-build'
      } 
    } 
  });
  
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
