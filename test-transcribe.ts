import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: 'tell me a joke'
  });
  console.log(JSON.stringify(response, null, 2));
}

run();
