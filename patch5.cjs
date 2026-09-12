const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldExport = `const text = currentCase.turns.map((t: any) => \`[\${t.speaker || 'Unknown'}] \${t.text}\`).join('');`;
const newExport = `const text = currentCase.turns.map((t: any) => \`[\${t.speaker || 'Unknown'}] \${t.isNote ? t.fullNote : t.text}\`).join('\\n');`;

app = app.replace(oldExport, newExport);
fs.writeFileSync('src/App.tsx', app);
