const fs = require('fs');
const data = JSON.parse(fs.readFileSync('deepgram_models.json', 'utf8'));
const bnModels = data.models.filter(m => m.language === 'bn' || m.language === 'bn-IN' || (m.languages && (m.languages.includes('bn') || m.languages.includes('bn-IN'))));
console.log(JSON.stringify(bnModels, null, 2));
