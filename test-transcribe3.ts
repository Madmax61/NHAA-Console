import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const base64Data = fs.readFileSync('test_valid.wav').toString('base64');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'audio/wav' } },
        { text: 'transcribe' }
      ]
    }
  });
  console.log(JSON.stringify(response.candidates?.[0]?.content?.parts, null, 2));
}

run();
