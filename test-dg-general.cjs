const WebSocket = require('ws');
const dgUrl = `wss://api.deepgram.com/v1/listen?model=general&language=bn&smart_format=true&diarize=true`;
const ws = new WebSocket(dgUrl, {
  headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` }
});
ws.on('open', () => {
  console.log('Connected general bn!');
  ws.close();
});
ws.on('error', (err) => console.log('Error:', err.message));
ws.on('close', (code, reason) => console.log('Closed', code, reason.toString()));
