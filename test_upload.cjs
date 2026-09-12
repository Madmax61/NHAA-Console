const fs = require('fs');
const path = require('path');

async function run() {
  const f = Buffer.alloc(10000, 0); // silent file
  fs.writeFileSync('test_silent.wav', f);

  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fs.createReadStream('test_silent.wav'));

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
