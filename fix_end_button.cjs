const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/<\/button>\s*\}\)\}\s*<div className="flex justify-center mt-4 pb-8">/, 
"</div>\n      ))}\n      <div className=\"flex justify-center mt-4 pb-8\">");
fs.writeFileSync('src/App.tsx', content);
