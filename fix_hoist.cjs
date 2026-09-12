const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace('const handleIncomingTurns = (incomingTurns: any[]) => {', 'function handleIncomingTurns(incomingTurns: any[]) {');

fs.writeFileSync('src/App.tsx', content);
