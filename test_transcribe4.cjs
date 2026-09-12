const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const f = Buffer.alloc(100, 0); // 100 bytes
  require('fs').writeFileSync('test_audio_fb.wav', f);
  let uploadRes = await ai.files.upload({ file: 'test_audio_fb.wav', config: { mimeType: 'audio/wav' } });
  while (uploadRes.state === 'PROCESSING') {
    await new Promise(r => setTimeout(r, 1000));
    uploadRes = await ai.files.get({ name: uploadRes.name });
  }

  const prompt = `
      Listen to this emergency audio file and provide a highly accurate, word-for-word transcript.
      CRITICAL INSTRUCTIONS:
      1. DIARIZATION (MANDATORY): You MUST separate the transcript into alternating turns between the dispatcher ('Operator') and the other person ('Caller'). Do NOT group multiple speakers into a single turn! Every time a different person speaks, you must create a new object in the JSON array.
      2. NATIVE SCRIPT: Transcribe exactly what is spoken in its native script. We expect languages like English, Hindi (हिन्दी), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), and Punjabi (ਪੰਜਾਬੀ). Do not translate spoken words into English.
      3. CODE-SWITCHING: If they switch languages mid-sentence, capture these switches perfectly using the correct scripts.
      4. OUTPUT FORMAT: Output ONLY a JSON array. Do not include markdown code blocks. Each object in the array must have these fields:
         - speaker (string, 'Operator' or 'Caller')
         - start (number)
         - end (number)
         - text (string, the transcript)
         - isFinal (boolean, always true)
         - language (string, e.g. 'English', 'Marathi', 'Mixed')
      `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: { parts: [
        { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType } },
        { text: prompt }
      ] }
    });
    console.log("RESPONSE TEXT:");
    console.log(response.text);
  } catch (e) {
    console.error("ERROR", e);
  }
}
run();
