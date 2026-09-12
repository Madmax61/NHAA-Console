require('dotenv').config();
const WebSocket = require('ws');
let dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&diarize=true&interim_results=true&endpointing=300`;
const dgWs = new WebSocket(dgUrl, {
  headers: {
    'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
  }
});
dgWs.on('open', () => { console.log('DG OPEN'); dgWs.close(); });
dgWs.on('error', (e) => console.log('DG ERROR', e.message));
