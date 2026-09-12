import 'dotenv/config';
import fs from 'fs';

async function run() {
  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=hi&smart_format=true&diarize=true', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: 'https://dpgr.am/spacewalk.wav' }) // spacewalk is english but DG might try to transcribe it as HI
  });
  const data = await res.json();
  const words = data.results?.channels[0]?.alternatives[0]?.words;
  if(words && words.length > 0) {
    console.log(words[0]);
  } else {
    console.log("No words", data);
  }
}
run();
