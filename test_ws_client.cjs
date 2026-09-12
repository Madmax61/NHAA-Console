const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:3000/ws/transcribe?language=bn');

ws.on('open', () => {
  console.log('WS OPEN');
  const buffer = fs.readFileSync('test_bn.wav');
  console.log('Sending buffer length:', buffer.length);
  // Send in chunks
  let offset = 0;
  const chunkSize = 4096;
  const interval = setInterval(() => {
    if (offset >= buffer.length) {
      clearInterval(interval);
      // ws.send(JSON.stringify({ type: 'CloseStream' }));
      return;
    }
    ws.send(buffer.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }, 100);
});
ws.on('message', (msg) => {
    console.log('MSG:', msg.toString());
});
ws.on('error', (e) => console.log('WS ERROR', e.message));
ws.on('close', (code, reason) => console.log('WS CLOSE', code, reason.toString()));

setTimeout(() => { ws.close(); process.exit(0); }, 3000);
