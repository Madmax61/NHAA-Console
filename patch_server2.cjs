const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `"signals": [] (short list of danger signals detected, e.g., [{"category": "WEAPON", "keyword": "knife", "description": "Weapon mentioned"}]),`;
const repl1 = `"signals": [] (short list of danger signals detected, e.g., [{"category": "WEAPON", "keyword": "knife", "description": "Weapon mentioned"}]),\n      "emotionalFactors": string[] (e.g., ["Fear", "Trauma", "Panic", "Anxiety", "Calmness"] detected from the context),`;

content = content.replace(target1, repl1);

const target2 = `riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', extractedLocation: null, detectedLanguage: null, translations: {}, correctedOriginals: {}`;
const repl2 = `riskScore: 0, signals: [], emotionalFactors: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', extractedLocation: null, detectedLanguage: null, translations: {}, correctedOriginals: {}`;

content = content.replace(target2, repl2);

fs.writeFileSync('server.ts', content);
console.log('Patched server.ts');
