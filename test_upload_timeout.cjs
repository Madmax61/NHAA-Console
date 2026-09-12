const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 1 } });
async function run() {
  const fs = require('fs');
  fs.writeFileSync('test_timeout.txt', 'hello');
  try {
    await ai.files.upload({ file: 'test_timeout.txt' });
    console.log("Success");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
