const fs = require('fs');

async function run() {
  const f = Buffer.alloc(10000, 0); // silent file
  fs.writeFileSync('test_silent.wav', f);

  const fileBuffer = fs.readFileSync('test_silent.wav');
  const blob = new Blob([fileBuffer], { type: 'audio/wav' });
  const form = new FormData();
  form.append('file', blob, 'test_silent.wav');

  try {
    const res = await fetch('http://localhost:3000/api/transcribe_file', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (e) {
    console.error(e);
  }
}
run();
