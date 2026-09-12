const WebSocket = require('ws');
const fs = require('fs');
const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=bn&diarize=true`;
const ws = new WebSocket(dgUrl, {
  headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` }
});
ws.on('open', () => {
  ws.send(fs.readFileSync('test_bn.wav'));
  setTimeout(() => ws.close(), 2000);
});
ws.on('message', (data) => console.log(JSON.parse(data.toString()).channel?.alternatives?.[0]?.transcript));
