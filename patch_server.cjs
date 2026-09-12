const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /models: \['gemini-3\.8-flash', 'gemini-3\.7-flash', 'gemini-3\.6-flash', 'gemini-3\.5-flash', 'gemini-2\.5-flash'\]/g;
content = content.replace(regex, "models: ['gemini-3.6-flash']");

fs.writeFileSync('server.ts', content);
