import WebSocket from 'ws';
import 'dotenv/config';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=mr&smart_format=true&diarize=true&encoding=linear16&sample_rate=16000`;
const ws = new WebSocket(dgUrl, {
  headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
});
ws.on('open', () => console.log('Connected MR nova-3 Exact'));
ws.on('error', (e) => console.log('Error', e));
ws.on('close', (c, r) => console.log('Closed', c, r.toString()));
