import WebSocket from 'ws';
import 'dotenv/config';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&language=mr&smart_format=true&diarize=true&encoding=linear16&sample_rate=16000`, {
  headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
});
ws.on('open', () => console.log('Connected MR'));
ws.on('error', (e) => console.log('Error MR', e));
ws.on('close', (c, r) => console.log('Closed MR', c, r.toString()));
