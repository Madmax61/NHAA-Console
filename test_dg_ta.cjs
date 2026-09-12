require('dotenv').config();
const WebSocket = require('ws');
let dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=ta&smart_format=true&diarize=true&interim_results=true&endpointing=300`;
const dgWs = new WebSocket(dgUrl, {
  headers: {
    'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
  }
});

dgWs.on('open', () => { 
  console.log('DG OPEN'); 
  setTimeout(() => { dgWs.send(JSON.stringify({ type: 'CloseStream' })); }, 500);
});
dgWs.on('message', (msg) => console.log('DG MSG', msg.toString()));
dgWs.on('error', (e) => console.log('DG ERROR', e.message));
dgWs.on('unexpected-response', (request, response) => {
    console.log('DG UNEXPECTED RESPONSE:', response.statusCode);
});
dgWs.on('close', (code, reason) => console.log('DG CLOSE', code, reason.toString()));

setTimeout(() => { dgWs.close(); process.exit(0); }, 3000);
