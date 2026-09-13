const WebSocket = require('ws');
require('dotenv').config();

const testUrl = (url) => {
  return new Promise((resolve) => {
    console.log("Testing:", url);
    const ws = new WebSocket(url, { headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` } });
    ws.on('open', () => { console.log("SUCCESS:", url); ws.close(); resolve(true); });
    ws.on('error', (err) => { console.log("ERROR:", url, err.message); resolve(false); });
    ws.on('unexpected-response', (req, res) => { console.log("UNEXPECTED RESPONSE:", url, res.statusCode); resolve(false); });
  });
}

async function run() {
  await testUrl('wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize=true&diarize_model=latest&interim_results=true&endpointing=300');
  await testUrl('wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize=true&interim_results=true&endpointing=300');
  await testUrl('wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize_model=v1&interim_results=true&endpointing=300');
  await testUrl('wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&diarize=true&interim_results=true&endpointing=300');
}
run();
