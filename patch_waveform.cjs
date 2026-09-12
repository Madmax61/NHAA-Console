const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';`;

content = content.replace(`import React, { useState, useEffect, useRef } from 'react';`, imports);

const waveformComponent = `
const AudioWaveform = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(56, 189, 248, 0.4)', // using Tailwind cyan-400 / info-tag color kinda
      progressColor: 'rgba(56, 189, 248, 0.9)',
      cursorColor: 'rgba(56, 189, 248, 1)',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
    });
    
    wavesurfer.load(url);
    
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    
    wavesurferRef.current = wavesurfer;
    
    return () => {
      wavesurfer.destroy();
    };
  }, [url]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="flex items-center gap-3 w-full bg-[var(--bg-panel)] border border-[var(--border)] p-2">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--bg-main)] hover:bg-[var(--info-tag)] text-white border border-[var(--border)] transition-colors rounded-full"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
};
`;

content = content.replace(`export default function App() {`, waveformComponent + '\nexport default function App() {');

const oldAudio = `{currentCase.audioUrl ? (
              <audio controls src={currentCase.audioUrl} className="w-full h-12" />
            ) : (`;

const newAudio = `{currentCase.audioUrl ? (
              <AudioWaveform url={currentCase.audioUrl} />
            ) : (`;

content = content.replace(oldAudio, newAudio);
fs.writeFileSync('src/App.tsx', content);
