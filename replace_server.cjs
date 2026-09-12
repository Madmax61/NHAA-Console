const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `    If the caller is speaking a language other than English (e.g., Bengali, Hindi), translate their turns to English.`;
const repl = `    If the caller is speaking a language other than English (e.g., Bengali, Hindi), translate their turns to English.
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.`;

content = content.replace(target, repl);
fs.writeFileSync('server.ts', content);
