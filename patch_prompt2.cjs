const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldPrompt = `You are an emergency CAD operator AI assistant. Analyze this ongoing conversation transcript.
    If a party is speaking a language other than English (such as Hindi, Bengali, Marathi, Gujarati, or Punjabi), translate their turns to English.
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.`;

const newPrompt = `You are an emergency CAD operator AI assistant. Analyze this ongoing conversation transcript.
    CRITICAL: The transcript comes from a live Speech-to-Text engine that frequently mishears foreign languages (e.g. Hindi, Bengali) as phonetically similar English words (e.g., mishearing "bolie" as "ball", or "dikkat hai" as "done facility", or "shuru" as "started"). 
    You must intelligently detect these phonetic hallucinations based on the conversational context, reconstruct the actual intended foreign phrase, output the correct native script in 'correctedOriginals', and provide the accurate English translation in 'translations'.
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.`;

content = content.replace(oldPrompt, newPrompt);

const oldCorrected = `"0": "If the original transcript for this turn contains phonetic/Romanized versions of non-English words (e.g. Hindi written in English letters like 'bolie'), output the text converted back into its native script (e.g. Devanagari 'बोलिए'). Only include turns that need correction.",`;

const newCorrected = `"0": "If the original transcript contains phonetic/Romanized foreign words OR English hallucinations (e.g. 'ball' instead of 'bolie'), output the completely reconstructed and corrected native script (e.g. 'बोलिए'). Only include turns that need correction.",`;

content = content.replace(oldCorrected, newCorrected);

fs.writeFileSync('server.ts', content);
