const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix MediaRecorder instantiation
const startListeningOld = `  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      const recorder = new MediaRecorder(stream, { mimeType });`;

const startListeningNew = `  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {};
        }
      }
      const recorder = new MediaRecorder(stream, options);`;

content = content.replace(startListeningOld, startListeningNew);

// Fix uploadAudioChunk logic
const uploadOld = `      const response = await fetch(\`\${backendUrl}/transcribe\`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(\`Backend responded with \${response.status} \${response.statusText}\`);
      }
      
      const data = await response.json();
      setIsConnected(true);
      setRawError(null);`;

const uploadNew = `      const response = await fetch(\`\${backendUrl}/transcribe\`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });
      
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('Audio chunk rejected:', response.status, errText);
        throw new Error(\`Audio chunk rejected: \${response.status} \${response.statusText} - \${errText}\`);
      }
      
      const data = await response.json();
      setRawError(null);`;

content = content.replace(uploadOld, uploadNew);

// Fix catch block
const catchOld = `    } catch (err: any) {
      console.warn('Backend disconnected:', err.message);
      setRawError(err.message || 'Failed to upload audio chunk');
    }`;
const catchNew = `    } catch (err: any) {
      console.warn('Upload chunk failed:', err.message);
      setRawError(err.message || 'Failed to upload audio chunk');
    }`;

content = content.replace(catchOld, catchNew);

// Fix dataavailable to ensure size checks and ignore missing data
const dataAvailableOld = `      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          await uploadAudioChunk(e.data);
        }
      };`;
const dataAvailableNew = `      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          await uploadAudioChunk(e.data);
        }
      };`;

content = content.replace(dataAvailableOld, dataAvailableNew);

fs.writeFileSync('src/App.tsx', content);
