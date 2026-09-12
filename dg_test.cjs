const WebSocket = require('ws');
const key = process.env.DEEPGRAM_API_KEY;
function testDG(url) {
  const ws = new WebSocket(url, { headers: { 'Authorization': `Token ${key}` } });
  ws.on('open', () => { console.log(url, 'OPEN'); ws.close(); });
  ws.on('error', (err) => console.log(url, 'ERROR:', err.message));
  ws.on('close', (code, reason) => console.log(url, 'CLOSE:', code, reason.toString()));
}
testDG(`wss://api.deepgram.com/v1/listen?model=nova-3&language=multi`);
testDG(`wss://api.deepgram.com/v1/listen?model=nova-2&language=multi`);
testDG(`wss://api.deepgram.com/v1/listen?model=nova-3&detect_language=true`);
testDG(`wss://api.deepgram.com/v1/listen?model=nova-2&detect_language=true`);
