const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/ws/transcribe');
ws.on('open', () => { console.log('OPEN'); ws.send('hello'); ws.close(); });
ws.on('error', (e) => console.log('ERROR', e));
ws.on('close', () => console.log('CLOSE'));
