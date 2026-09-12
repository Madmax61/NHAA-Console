import WebSocket from 'ws';
import 'dotenv/config';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

['gu', 'pa'].forEach(lang => {
  const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&smart_format=true&diarize=true&encoding=linear16&sample_rate=16000`, {
    headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
  });
  ws.on('open', () => console.log('Connected', lang));
  ws.on('error', (e) => console.log('Error', lang, e.message));
});
