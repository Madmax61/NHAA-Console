const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\s*\)\};\s*<div className="grid grid-cols-2/g, '\n            )}\n            <div className="grid grid-cols-2');

fs.writeFileSync('src/App.tsx', content);
