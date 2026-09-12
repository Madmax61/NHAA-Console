const WebSocket = require('ws');
const key = process.env.DEEPGRAM_API_KEY;
function testLang(model, lang) {
  return new Promise((resolve) => {
    const url = `wss://api.deepgram.com/v1/listen?model=${model}&language=${lang}`;
    const ws = new WebSocket(url, { headers: { 'Authorization': `Token ${key}` } });
    ws.on('open', () => { console.log(model, lang, 'OPEN'); ws.close(); resolve(); });
    ws.on('error', (err) => { console.log(model, lang, 'ERROR:', err.message); resolve(); });
  });
}
async function run() {
  await testLang('nova-3', 'hi');
  await testLang('nova-2', 'hi');
}
run();
