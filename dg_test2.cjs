const fs = require('fs');
const WebSocket = require('ws');
const key = process.env.DEEPGRAM_API_KEY;

function testDiarize(model) {
  return new Promise((resolve) => {
    const url = `wss://api.deepgram.com/v1/listen?model=${model}&diarize=true&smart_format=true&encoding=linear16&sample_rate=16000`;
    const ws = new WebSocket(url, { headers: { 'Authorization': `Token ${key}` } });
    
    ws.on('open', () => {
      console.log(model, 'OPEN');
      // send some dummy audio or just close
      ws.close();
      resolve();
    });
    ws.on('error', (err) => {
      console.log(model, 'ERROR:', err.message);
      resolve();
    });
  });
}
async function run() {
  await testDiarize('nova-3');
  await testDiarize('nova-2');
}
run();
