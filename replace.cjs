const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const setTurnsRegex = /setTurns\(prevTurns => \{[\s\S]*?return newTurns;\n      \}\);/;
const replacement = `setTurns(prevTurns => {
        const newTurns = data.turns || [];
        if (newTurns.length > 0) {
          const combined = [...prevTurns, ...newTurns];
          analyzeTranscript(combined);
          return combined;
        }
        return prevTurns;
      });`;

content = content.replace(setTurnsRegex, replacement);
fs.writeFileSync('src/App.tsx', content);
