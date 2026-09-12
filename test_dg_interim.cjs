require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
let dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&diarize=true&interim_results=true&endpointing=300`;
const dgWs = new WebSocket(dgUrl, { headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` } });

dgWs.on('open', () => { 
  console.log('OPEN'); 
  // Send a tiny bit of audio
  if(fs.existsSync('test_valid.wav')) {
    dgWs.send(fs.readFileSync('test_valid.wav'));
  }
  setTimeout(() => dgWs.send(JSON.stringify({type: 'CloseStream'})), 2000);
});

dgWs.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.channel) {
    console.log('TRANSCRIPT:', msg.channel.alternatives[0].transcript);
    console.log('WORDS:', msg.channel.alternatives[0].words);
  } else {
    console.log('OTHER MSG:', msg.type);
  }
});
