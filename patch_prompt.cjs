const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldPromptShape = `"translations": { 
         "0": "English translation for [Turn 0] if not English",
         "1": "..."
      }`;

const newPromptShape = `"translations": { 
         "0": "English translation for [Turn 0] if not English",
         "1": "..."
      },
      "correctedOriginals": {
         "0": "If the original transcript for this turn contains phonetic/Romanized versions of non-English words (e.g. Hindi written in English letters like 'bolie'), output the text converted back into its native script (e.g. Devanagari 'बोलिए'). Only include turns that need correction.",
         "1": "..."
      }`;

content = content.replace(oldPromptShape, newPromptShape);

const oldParsedReport = `locationStatus: 'Unknown', extractedLocation: null, detectedLanguage: null, translatedTurns: []`;
const newParsedReport = `locationStatus: 'Unknown', extractedLocation: null, detectedLanguage: null, translations: {}, correctedOriginals: {}`;

content = content.replace(oldParsedReport, newParsedReport);

fs.writeFileSync('server.ts', content);
