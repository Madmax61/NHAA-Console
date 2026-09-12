const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldUrl = "`wss://api.deepgram.com/v1/listen?model=nova-3&language=${targetLanguage}&smart_format=true&diarize=true&encoding=linear16&sample_rate=16000`";
const newUrl = "`wss://api.deepgram.com/v1/listen?model=nova-2&language=${targetLanguage}&smart_format=true&diarize=true&interim_results=true&endpointing=300&encoding=linear16&sample_rate=16000`";

content = content.replace(oldUrl, newUrl);
fs.writeFileSync('server.ts', content);
