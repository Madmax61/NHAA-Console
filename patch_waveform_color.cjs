const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("waveColor: 'rgba(56, 189, 248, 0.4)'", "waveColor: '#2E4457'");
content = content.replace("progressColor: 'rgba(56, 189, 248, 0.9)'", "progressColor: '#4FB8B0'");
content = content.replace("cursorColor: 'rgba(56, 189, 248, 1)'", "cursorColor: '#E4572E'");

fs.writeFileSync('src/App.tsx', content);
