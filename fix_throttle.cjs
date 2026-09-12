const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldCode = `          // Debounce Gemini analysis so we don't spam it on every interim word
          if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
          
          if (finalAdded) {
             analyzeTranscript(nextTurns);
          } else {
             analysisTimerRef.current = setTimeout(() => {
                 analyzeTranscript(nextTurns);
             }, 2000);
          }
          return nextTurns;`;

const newCode = `          // Throttle Gemini analysis to max 1 request per 15s to avoid 429 quota limits on free tier
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
          return nextTurns;`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', content);
