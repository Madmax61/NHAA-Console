const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

let badString = `          } else {
            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && lastTurn.speaker === (inc.speaker || "Unknown") && (inc.start - lastTurn.end) < 2.0) {
              lastTurn.text += " " + inc.text;
              lastTurn.end = inc.end;
              updated = true;
            } else {
              analysisTimerRef.current = setTimeout(() => {
                  (analysisTimerRef as any).lastRun = Date.now();
                  analyzeTranscript(nextTurns);
              }, 15000 - (now - lastAnalysisTime));
          }`;

let goodString = `          } else {
              analysisTimerRef.current = setTimeout(() => {
                  (analysisTimerRef as any).lastRun = Date.now();
                  analyzeTranscript(nextTurns);
              }, 15000 - (now - lastAnalysisTime));
          }`;

content = content.replace(badString, goodString);
fs.writeFileSync('src/App.tsx', content);
