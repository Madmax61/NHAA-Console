const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: "Hi"
    });
    console.log("TEXT:", res.text);
  } catch (e) {
    console.log("ERROR MESSAGE", e.message);
  }
}
run();
