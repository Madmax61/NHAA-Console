const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/models: \['gemini-3\.6-flash', 'gemini-1\.5-flash', 'gemini-1\.5-pro'\]/g, "models: ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05']");

fs.writeFileSync('server.ts', content);
