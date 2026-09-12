const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add mediaRecorderRef
content = content.replace(/const wsRef = useRef<WebSocket \| null>\(null\);/, 
  "const wsRef = useRef<WebSocket | null>(null);\n  const mediaRecorderRef = useRef<MediaRecorder | null>(null);\n  const audioChunksRef = useRef<Blob[]>([]);");

// 2. Start recording in startListening
const startRegex = /streamRef\.current = stream;/;
content = content.replace(startRegex, 
  `streamRef.current = stream;
      audioChunksRef.current = [];
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          updateCase(currentCase.id, { audioUrl });
        };
        mediaRecorder.start();
      } catch (e) {
        console.warn("MediaRecorder setup failed:", e);
      }`);

// 3. Stop recording in stopListening
const stopRegex = /if \(streamRef\.current\) \{/;
content = content.replace(stopRegex, 
  `if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {`);

// 4. Update file upload to save object URL
const uploadRegex = /const normalizedTurns = normalizeTranscript\(data\);/;
content = content.replace(uploadRegex,
  `const localAudioUrl = URL.createObjectURL(file);
      updateCase(currentCase.id, { audioUrl: localAudioUrl });
      const normalizedTurns = normalizeTranscript(data);`);

fs.writeFileSync('src/App.tsx', content);
