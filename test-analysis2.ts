import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const prompt = `
    You are an emergency CAD operator AI assistant. Analyze this ongoing conversation transcript.
    CRITICAL: The transcript comes from a live Speech-to-Text engine that frequently mishears foreign languages (e.g. Hindi, Bengali) as phonetically similar English words. 
    You must intelligently detect these phonetic hallucinations based on the conversational context, reconstruct the actual intended foreign phrase, output the correct native script in 'correctedOriginals', and provide the accurate English translation in 'translations'.
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.
    
    Output your analysis as a strict JSON object with this shape:
    {
      "caseTitle": string,
      "riskScore": number,
      "translations": { "0": "English translation for [Turn 0] if not English" }
    }
    
    Transcript:
    [Turn 0] Caller: আমার বাড়িতে আগুন লেগেছে
    [Turn 1] Operator: আপনি কোথায় আছেন?
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  console.log(response.text);
}

run();
