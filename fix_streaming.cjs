const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert new refs
content = content.replace(
  'const mediaRecorderRef = useRef<MediaRecorder | null>(null);',
  'const mediaRecorderRef = useRef<MediaRecorder | null>(null);\n  const isRunningRef = useRef(false);\n  const streamRef = useRef<MediaStream | null>(null);'
);

// Replace start/stop listening
const oldListening = `  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {};
        }
      }
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          await uploadAudioChunk(e.data);
        }
      };
      
      recorder.start(5000);
      setIsRunning(true);
      setMicError(null);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
      setIsRunning(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      mediaRecorderRef.current = null;
    }
    setIsRunning(false);
  };`;

const newListening = `  const startListening = async () => {
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
  };

  const stopListening = () => {
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

if (content.includes(oldListening)) {
  content = content.replace(oldListening, newListening);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully applied start/stop listening replacements');
} else {
  console.log('Failed to match oldListening');
}
