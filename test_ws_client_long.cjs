const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:3000/ws/transcribe?language=bn');

ws.on('open', () => {
  console.log('WS OPEN');
  const buffer = fs.readFileSync('test_bn.wav');
  // send the buffer multiple times to simulate a long stream
  let count = 0;
  const interval = setInterval(() => {
    ws.send(buffer, { binary: true });
    count++;
    if (count > 5) {
      clearInterval(interval);
      console.log('Done sending');
    }
  }, 500);
});
ws.on('message', (msg) => {
    console.log('MSG:', msg.toString());
});
setTimeout(() => { ws.close(); process.exit(0); }, 5000);
