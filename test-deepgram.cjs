const WebSocket = require('ws');
require('dotenv').config();

const testUrl = (url) => {
  return new Promise((resolve) => {
    console.log("Testing:", url);
    const ws = new WebSocket(url, { headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` } });
    ws.on('open', () => { console.log("SUCCESS"); ws.close(); resolve(true); });
    ws.on('error', (err) => { console.log("ERROR:", err.message); resolve(false); });
    ws.on('unexpected-response', (req, res) => { console.log("UNEXPECTED RESPONSE:", res.statusCode); resolve(false); });
  });
}

async function run() {
  await testUrl('wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize_model=latest&interim_results=true&endpointing=300');
}
run();
