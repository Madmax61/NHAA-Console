const fs = require('fs');
const data = JSON.parse(fs.readFileSync('deepgram_models.json', 'utf8'));
const multiModels = data.stt.filter(m => m.language === 'multi' || (m.languages && m.languages.includes('multi')));
console.log(JSON.stringify(multiModels, null, 2));
