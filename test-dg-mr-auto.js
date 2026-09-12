import WebSocket from 'ws';
import 'dotenv/config';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?language=mr&encoding=linear16&sample_rate=16000`, {
  headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
});
ws.on('open', () => console.log('Connected auto MR'));
ws.on('error', (e) => console.log('Error', e));
ws.on('close', (c, r) => console.log('Closed', c, r.toString()));
