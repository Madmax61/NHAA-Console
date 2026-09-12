const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace uploadAudioChunk
const uploadAudioChunkOld = /const uploadAudioChunk = async \(blob: Blob\) => \{[\s\S]*?const analyzeTranscript = async \(currentTurns: any\[\]\) => \{/m;
const uploadAudioChunkNew = `const uploadAudioChunk = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'chunk.webm');
      
      const response = await fetch(\`\${backendUrl}/transcribe\`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(\`Backend responded with \${response.status} \${response.statusText}\`);
      }
      
      const data = await response.json();
      setIsConnected(true);
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
              ...inc,
              speaker: spk,
              isFinal: false
            });
            updated = true;
          }
        });
        
        const maxIncomingEnd = Math.max(...incomingTurns.map((t: any) => t.end));
        nextTurns.forEach(t => {
            if (!t.isFinal && maxIncomingEnd > t.end + 5) {
                t.isFinal = true;
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
      console.warn('Backend disconnected:', err.message);
      setRawError(err.message || 'Failed to upload audio chunk');
    }
  };

  const analyzeTranscript = async (currentTurns: any[]) => {`;

content = content.replace(uploadAudioChunkOld, uploadAudioChunkNew);

// Update analyzeTranscript payload
const analyzeOld = /body: JSON\.stringify\(\{ turns: currentTurns \}\)/;
const analyzeNew = `body: JSON.stringify({ 
          turns: currentTurns.map(t => ({
              ...t,
              text: t.isFinal ? t.text : \`\${t.text} (PARTIAL - DO NOT TRANSLATE)\`
          })) 
        })`;

content = content.replace(analyzeOld, analyzeNew);

// Update UI to ignore translation if not final
// Search for:
/*
                  {/* Display Translation if available, otherwise Original * /}
                  {analysis.translations && analysis.translations[idx.toString()] ? (
                    <>
                      <span>{renderTextWithHighlights(analysis.translations[idx.toString()], riskSignals)}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                        {turn.text}
                      </span>
                    </>
                  ) : (
                    <span>{renderTextWithHighlights(turn.text, riskSignals)}</span>
                  )}
*/

const uiOld = /\{\/\* Display Translation if available, otherwise Original \*\/\}\s*\{analysis\.translations && analysis\.translations\[idx\.toString\(\)\] \? \([\s\S]*?\) : \([\s\S]*?\}\)\}\s*<\/span>\s*\)\}/m;
const uiNew = `{/* Display Translation if available, otherwise Original */}
                  {(turn.isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (
                    <>
                      <span>{renderTextWithHighlights(analysis.translations[idx.toString()], riskSignals)}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                        {turn.text}
                      </span>
                    </>
                  ) : (
                    <span className={!turn.isFinal ? "opacity-70" : ""}>{renderTextWithHighlights(turn.text, riskSignals)}</span>
                  )}`;

content = content.replace(uiOld, uiNew);

fs.writeFileSync('src/App.tsx', content);
