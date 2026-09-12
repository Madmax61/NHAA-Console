const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

let loopEnd = `            nextTurns.push({
              speaker: inc.speaker || 'Unknown',
              start: inc.start,
              end: inc.end,
              text: inc.text,
              isFinal: inc.isFinal || false
            });
            updated = true;
            if (inc.isFinal) finalAdded = true;
            }
          }
        });`;

let fixedLoopEnd = `            nextTurns.push({
              speaker: inc.speaker || 'Unknown',
              start: inc.start,
              end: inc.end,
              text: inc.text,
              isFinal: inc.isFinal || false
            });
            updated = true;
            if (inc.isFinal) finalAdded = true;
            }
          }
        });`;

// Wait, the inner block didn't have the missing bracket added?
// Let's just find exactly what it looks like and rewrite handleIncomingTurns using regex.

const match = content.match(/function handleIncomingTurns\([\s\S]*?const analyzeTranscript/);
if (match) {
  let newFn = `function handleIncomingTurns(incomingTurns: any[]) {
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
            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && lastTurn.speaker === (inc.speaker || 'Unknown') && (inc.start - lastTurn.end) < 2.0) {
              lastTurn.text += " " + inc.text;
              lastTurn.end = inc.end;
              updated = true;
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
          }
        });

        nextTurns.sort((a, b) => a.start - b.start);

        if (updated) {
          if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
          const now = Date.now();
          const lastAnalysisTime = (analysisTimerRef as any).lastRun || 0;
          if (now - lastAnalysisTime > 15000) {
              (analysisTimerRef as any).lastRun = now;
              analyzeTranscript(nextTurns);
          } else {
              analysisTimerRef.current = setTimeout(() => {
                  (analysisTimerRef as any).lastRun = Date.now();
                  analyzeTranscript(nextTurns);
              }, 15000 - (now - lastAnalysisTime));
          }
          return nextTurns;
        }
        return prevTurns;
      });
  }

  const analyzeTranscript`;
  content = content.replace(match[0], newFn);
  fs.writeFileSync('src/App.tsx', content);
}
