const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:3000/ws/transcribe?language=multi');

ws.on('open', () => {
    console.log('WS OPEN');
    if (fs.existsSync('test_valid.wav')) {
        const data = fs.readFileSync('test_valid.wav');
        console.log('Sending audio:', data.length);
        ws.send(data);
    } else {
        console.log('test_valid.wav not found');
    }
    setTimeout(() => { 
        console.log('Sending CloseStream');
        ws.send(JSON.stringify({ type: 'CloseStream' }));
    }, 1000);
    setTimeout(() => { ws.close(); process.exit(0); }, 3000);
});

ws.on('message', (msg) => {
    console.log('MSG FROM SERVER:', msg.toString());
});

ws.on('error', (err) => {
    console.log('WS ERROR:', err);
});
