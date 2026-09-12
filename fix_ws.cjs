const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add wsRef and debounce timer to App
content = content.replace(
  'const streamRef = useRef<MediaStream | null>(null);',
  'const streamRef = useRef<MediaStream | null>(null);\n  const wsRef = useRef<WebSocket | null>(null);\n  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);'
);

// Replace startListening and startRecordingChunk
const oldStartListening = `  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRunning(true);
      isRunningRef.current = true;
      setMicError(null);
      
      startRecordingChunk(stream);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  const startRecordingChunk = (stream: MediaStream) => {
      let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {};
        }
      }
      const recorder = new MediaRecorder(stream, options);
      let chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: options.mimeType || 'audio/webm' });
          await uploadAudioChunk(blob);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      setTimeout(() => {
        if (recorder.state === 'recording') {
            recorder.stop();
            if (isRunningRef.current) {
                startRecordingChunk(stream);
            }
        }
      }, 5000);
  };`;

const newStartListening = `  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/transcribe';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
          setIsConnected(true);
          setRawError(null);
          
          let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              options = {};
            }
          }
          
          const recorder = new MediaRecorder(stream, options);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
            }
          };
          recorder.start(250); // Send chunks every 250ms for real-time streaming
          mediaRecorderRef.current = recorder;
          
          setIsRunning(true);
          isRunningRef.current = true;
          setMicError(null);
      };
      
      ws.onmessage = (e) => {
          try {
              const data = JSON.parse(e.data);
              if (data.turns) {
                  handleIncomingTurns(data.turns);
              }
          } catch (err) {}
      };
      
      ws.onerror = (e) => {
          setRawError('WebSocket connection error.');
          stopListening();
      };
      
      ws.onclose = () => {
          setIsConnected(false);
          stopListening();
      };
      
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };`;

content = content.replace(oldStartListening, newStartListening);

// Replace stopListening to close WS
const oldStopListening = `  const stopListening = () => {
    isRunningRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRunning(false);
  };`;

const newStopListening = `  const stopListening = () => {
    isRunningRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRunning(false);
  };`;

content = content.replace(oldStopListening, newStopListening);

// Replace uploadAudioChunk with handleIncomingTurns
const oldUpload = `  const uploadAudioChunk = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'chunk.webm');
      
      const response = await fetch(\`\${backendUrl}/transcribe\`, {
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
      setRawError(null);
      
      setTurns(prevTurns => {
        const incomingTurns = data.turns || [];
        if (incomingTurns.length === 0) return prevTurns;

        let updated = false;
        const nextTurns = prevTurns.map(t => ({...t}));

        incomingTurns.forEach((inc: any) => {
          const existingIdx = nextTurns.findIndex(pt => Math.abs(pt.start - inc.start) < 0.2);

          if (existingIdx >= 0) {
            const existing = nextTurns[existingIdx];
            
            if (inc.speaker) existing.speaker = inc.speaker;

            if (existing.text !== inc.text || existing.end !== inc.end) {
              existing.text = inc.text;
              existing.end = inc.end;
              updated = true;
            } else {
              if (!existing.isFinal) {
                existing.isFinal = true;
                updated = true;
              }
            }
          } else {
            let spk = inc.speaker;
            if (!spk) {
                const lastSpk = nextTurns.length > 0 ? nextTurns[nextTurns.length - 1].speaker : 'Caller';
                spk = lastSpk === 'Operator' ? 'Caller' : 'Operator';
            }
            nextTurns.push({
              speaker: spk,
              start: inc.start,
              end: inc.end,
              text: inc.text,
              isFinal: inc.isFinal || false
            });
            updated = true;
          }
        });

        nextTurns.sort((a, b) => a.start - b.start);

        if (updated) {
          analyzeTranscript(nextTurns);
          return nextTurns;
        }
        return prevTurns;
      });
    } catch (err: any) {
      console.warn('Upload chunk failed:', err.message);
      setRawError(err.message || 'Failed to upload audio chunk');
    }
  };`;

const newUpload = `  const handleIncomingTurns = (incomingTurns: any[]) => {
      setTurns(prevTurns => {
        if (!incomingTurns || incomingTurns.length === 0) return prevTurns;

        let updated = false;
        let finalAdded = false;
        const nextTurns = prevTurns.map(t => ({...t}));

        incomingTurns.forEach((inc: any) => {
          const existingIdx = nextTurns.findIndex(pt => Math.abs(pt.start - inc.start) < 0.2);

          if (existingIdx >= 0) {
            const existing = nextTurns[existingIdx];
            
            if (inc.speaker) existing.speaker = inc.speaker;

            if (existing.text !== inc.text || existing.end !== inc.end) {
              existing.text = inc.text;
              existing.end = inc.end;
              updated = true;
            } 
            if (inc.isFinal && !existing.isFinal) {
              existing.isFinal = true;
              updated = true;
              finalAdded = true;
            }
          } else {
            nextTurns.push({
              speaker: inc.speaker || 'Unknown',
              start: inc.start,
              end: inc.end,
              text: inc.text,
              isFinal: inc.isFinal || false
            });
            updated = true;
            if (inc.isFinal) finalAdded = true;
          }
        });

        nextTurns.sort((a, b) => a.start - b.start);

        if (updated) {
          // Debounce Gemini analysis so we don't spam it on every interim word
          if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
          
          if (finalAdded) {
             // Immediate analysis on final sentence
             analyzeTranscript(nextTurns);
          } else {
             // Delay analysis while still speaking
             analysisTimerRef.current = setTimeout(() => {
                 analyzeTranscript(nextTurns);
             }, 2000);
          }
          return nextTurns;
        }
        return prevTurns;
      });
  };`;

content = content.replace(oldUpload, newUpload);

fs.writeFileSync('src/App.tsx', content);
console.log('Done replacement');
