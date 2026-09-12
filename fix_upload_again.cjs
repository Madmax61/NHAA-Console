const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const uploadAudioChunk = async \(blob: Blob\) => \{[\s\S]*?catch \(err: any\) \{\s*console\.warn\('Upload chunk failed:', err\.message\);\s*setRawError\(err\.message \|\| 'Failed to upload audio chunk'\);\s*\}\s*\};/;

const replacement = `function handleIncomingTurns(incomingTurns: any[]) {
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
             analyzeTranscript(nextTurns);
          } else {
             analysisTimerRef.current = setTimeout(() => {
                 analyzeTranscript(nextTurns);
             }, 2000);
          }
          return nextTurns;
        }
        return prevTurns;
      });
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
