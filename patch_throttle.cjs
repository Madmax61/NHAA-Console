const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/15000/g, "30000");

fs.writeFileSync('src/App.tsx', content);
