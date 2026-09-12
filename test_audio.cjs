const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const fs = require('fs');
  // Write a valid tiny wav file header + some data
  // RIFF...WAVEfmt ... data...
  const wav = Buffer.from('524946462400000057415645666d7420100000000100010044ac000088580100020010006461746100000000', 'hex');
  fs.writeFileSync('test_valid.wav', wav);

  let uploadRes = await ai.files.upload({ file: 'test_valid.wav', config: { mimeType: 'audio/wav' } });
  while (uploadRes.state === 'PROCESSING') {
    await new Promise(r => setTimeout(r, 1000));
    uploadRes = await ai.files.get({ name: uploadRes.name });
  }
  
  console.log("Uploaded valid wav file", uploadRes.uri);

  const stream = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: { parts: [
      { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType } },
      { text: "Say hi" }
    ] }
  });
  console.log("RESPONSE:", stream.text);
}
run();
