const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'placeholder="Backend URL"',
  'placeholder="https://...ngrok-free.app"'
);

fs.writeFileSync('src/App.tsx', content);
