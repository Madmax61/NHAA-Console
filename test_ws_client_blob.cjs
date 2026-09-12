const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:3000/ws/transcribe?language=bn');

ws.on('open', () => {
  console.log('WS OPEN');
  const buffer = fs.readFileSync('test_bn.wav');
  ws.send(buffer);
  setTimeout(() => {
      ws.send(JSON.stringify({ type: "CloseStream" }));
  }, 500);
});
ws.on('message', (msg) => {
    console.log('MSG:', msg.toString());
});
setTimeout(() => { ws.close(); process.exit(0); }, 3000);
