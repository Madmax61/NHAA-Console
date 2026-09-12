const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `updateCase(currentCase.id, { turns, analysis, metaData, phone: phoneNumber });`;
const newTarget = `updateCase(currentCase.id, { 
        turns, 
        analysis, 
        metaData, 
        phone: phoneNumber,
        ...(analysis.caseTitle && { type: analysis.caseTitle.toUpperCase() })
      });`;

content = content.replace(target, newTarget);
fs.writeFileSync('src/App.tsx', content);
