const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/models: \['gemini-3\.6-flash', 'gemini-2\.0-flash', 'gemini-1\.5-flash'\]/g, "models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']");

fs.writeFileSync('server.ts', content);
