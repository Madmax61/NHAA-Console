import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import https from 'https';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function download(url: string, path: string) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(path);
      res.pipe(file);
      file.on('finish', () => resolve(true));
    });
  });
}

async function run() {
  await download('https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', 'test.wav');
  const base64Data = fs.readFileSync('test.wav').toString('base64');
  
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
