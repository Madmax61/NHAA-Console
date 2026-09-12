const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const waveformRegex = /\{\/\* Fake Waveform based on ID \*\/\}.*?<\/div>/s;
const audioPlayerReplacement = `{/* Audio Player or Waveform */}
            {currentCase.audioUrl ? (
              <audio controls src={currentCase.audioUrl} className="w-full h-12" />
            ) : (
              <div className="h-16 w-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center overflow-hidden px-1 space-x-[2px]">
                {Array.from({ length: 60 }).map((_, i) => {
                   const h = (Math.sin(i * 0.5 + currentCase.id.charCodeAt(0)) * 40) + 50 + (Math.random() * 10);
                   return <div key={i} className="w-1 bg-[var(--info-tag)]" style={{ height: \`\${h}%\`, opacity: currentCase.status === 'RESOLVED' ? 0.3 : (i < 30 ? 1 : 0.3) }}></div>;
                })}
              </div>
            )}`;

content = content.replace(waveformRegex, audioPlayerReplacement);

const checksumRegex = /<div>\s*<div className="text-\[var\(--text-secondary\)\] mb-1">AI Model Checksum<\/div>\s*<div className="p-2 bg-\[var\(--bg-panel\)\] border border-\[var\(--border\)\] text-\[var\(--text-primary\)\]">\s*gemini-1\.5-pro-001 \(\{currentCase\.id\.substring\(currentCase\.id\.length - 4\)\}\)\s*<\/div>\s*<\/div>/s;

content = content.replace(checksumRegex, '');

fs.writeFileSync('src/App.tsx', content);
