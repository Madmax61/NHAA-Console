import WebSocket from 'ws';
import 'dotenv/config';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  console.log("No key");
  process.exit(0);
}

const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=hi&smart_format=true&diarize=true&encoding=linear16&sample_rate=16000`;
console.log("Connecting to", dgUrl);
const ws = new WebSocket(dgUrl, {
  headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
});

ws.on('open', () => {
  console.log("Connected to Deepgram!");
  ws.close();
});

ws.on('error', (err) => {
  console.log("Error:", err);
});

ws.on('close', (code, reason) => {
  console.log("Closed:", code, reason.toString());
});
