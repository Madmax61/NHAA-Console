const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const fs = require('fs');
  const wav = Buffer.from('524946462400000057415645666d7420100000000100010044ac000088580100020010006461746100000000', 'hex');
  fs.writeFileSync('test_valid.wav', wav);

  let uploadRes = await ai.files.upload({ file: 'test_valid.wav', config: { mimeType: 'audio/wav' } });
  while (uploadRes.state === 'PROCESSING') {
    await new Promise(r => setTimeout(r, 1000));
    uploadRes = await ai.files.get({ name: uploadRes.name });
  }

  const prompt = "Output JSON array of objects with speaker and text.";
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: { parts: [
        { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType } },
        { text: prompt }
      ] }
    });
    console.log("TEXT:", res.text);
  } catch (e) {
    console.log("ERROR", e.status, e.message);
  }
}
run();
