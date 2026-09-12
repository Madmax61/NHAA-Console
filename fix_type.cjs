const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `      let options = { mimeType: 'audio/webm;codecs=opus' };`;
const repl = `      let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };`;
content = content.replace(target, repl);
fs.writeFileSync('src/App.tsx', content);
