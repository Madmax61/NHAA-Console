require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
let dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=bn&smart_format=true&diarize=true&interim_results=true&endpointing=300`;
const dgWs = new WebSocket(dgUrl, {
  headers: {
    'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
  }
});

dgWs.on('open', () => { 
  console.log('DG OPEN');
  const buffer = fs.readFileSync('test_bn.wav');
  console.log('Sending buffer length:', buffer.length);
  // Send in chunks
  let offset = 0;
  const chunkSize = 4096;
  const interval = setInterval(() => {
    if (offset >= buffer.length) {
      clearInterval(interval);
      dgWs.send(JSON.stringify({ type: 'CloseStream' }));
      return;
    }
    dgWs.send(buffer.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }, 100);
});
dgWs.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.channel && data.channel.alternatives[0].transcript) {
        console.log('TRANSCRIPT:', data.channel.alternatives[0].transcript);
    }
});
dgWs.on('error', (e) => console.log('DG ERROR', e.message));
dgWs.on('close', (code, reason) => console.log('DG CLOSE', code, reason.toString()));
