import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function checkModel(model) {
  try {
    const res = await ai.models.generateContent({
      model,
      contents: 'hello',
    });
    console.log(model, 'SUCCESS');
  } catch (err) {
    console.log(model, 'FAILED:', err.status, err.message);
  }
}

async function run() {
  await checkModel('gemini-3.4-flash');
  await checkModel('gemini-3.3-flash');
  await checkModel('gemini-3.2-flash');
  await checkModel('gemini-3.1-flash');
  await checkModel('gemini-3.0-flash');
}
run();
