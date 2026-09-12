const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The messed up part starts at line 431
// Let's replace the messed up throttle else block:

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

// And we need to fix the first replacement that missed the bracket.
// I will just completely replace the handleIncomingTurns function text.
