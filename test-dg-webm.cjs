const WebSocket = require('ws');
const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=en`;
const ws = new WebSocket(dgUrl, {
  headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` }
});
ws.on('open', () => {
  console.log("opened");
  ws.close();
});
