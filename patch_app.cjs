const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Patch 1: Add onVerify handler to LocationConfidenceMap usage
const oldMap = '<LocationConfidenceMap analysis={analysis} />';
const newMap = `<LocationConfidenceMap analysis={analysis} onVerify={(est) => {
                const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const logStr = \`Location verified: \${est.label || 'Unknown'} (\${est.latitude}, \${est.longitude})\`;
                const newLog = {
                  id: Date.now() + Math.random(),
                  speaker: 'SYS',
                  start: 0,
                  end: 0,
                  timestamp: timeStr,
                  text: '*Operator verified location*',
                  isFinal: true,
                  isNote: true,
                  fullNote: logStr
                };
                updateCase(currentCase.id, {
                  turns: [...(currentCase.turns || []), newLog],
                  auditLog: [...(currentCase.auditLog || []), \`Location manually verified at \${timeStr}\`]
                });
              }} />`;
code = code.replace(oldMap, newMap);

// Patch 2: Diarization fix for live audio
const oldDiarization = `            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && !lastTurn.isFinal) {
              // Update the ongoing turn
              if (lastTurn.text !== inc.text) {
                lastTurn.text = inc.text;
                updated = true;
              }
              if (inc.isFinal) {
                lastTurn.isFinal = true;
                updated = true;
                finalAdded = true;
              }
            } else {
              // Create a new turn`;

const newDiarization = `            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && !lastTurn.isFinal) {
              // Diarization fix: if speaker changes during an ongoing turn, force finalize it and start a new one
              if (inc.speaker && lastTurn.speaker !== 'Unknown' && lastTurn.speaker !== inc.speaker) {
                 lastTurn.isFinal = true;
                 nextTurns.push({
                   id: Date.now() + Math.random(),
                   speaker: inc.speaker,
                   start: lastTurn.end + 0.1,
                   end: lastTurn.end + 2.0,
                   timestamp: inc.timestamp || lastTurn.timestamp,
                   text: inc.text,
                   isFinal: inc.isFinal || false
                 });
                 updated = true;
                 if (inc.isFinal) finalAdded = true;
              } else {
                 // Update the ongoing turn
                 if (inc.speaker && lastTurn.speaker === 'Unknown') lastTurn.speaker = inc.speaker;
                 if (lastTurn.text !== inc.text) {
                   lastTurn.text = inc.text;
                   updated = true;
                 }
                 if (inc.isFinal) {
                   lastTurn.isFinal = true;
                   updated = true;
                   finalAdded = true;
                 }
              }
            } else {
              // Create a new turn`;

code = code.replace(oldDiarization, newDiarization);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
