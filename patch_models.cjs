const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/models: \['gemini-3\.6-flash'\]/g, "models: ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']");

fs.writeFileSync('server.ts', content);
