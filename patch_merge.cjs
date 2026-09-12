const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `              const lastTurn = nextTurns[nextTurns.length - 1];
              if (lastTurn && lastTurn.speaker === (inc.speaker || 'Unknown') && (inc.start - lastTurn.end) < 2.0) {
                lastTurn.text += " " + inc.text;
                lastTurn.end = inc.end;
                updated = true;
              } else {
                nextTurns.push({`;

const newLogic = `              const lastTurn = nextTurns[nextTurns.length - 1];
              // Removed the aggressive 2.0 second merging to prevent caller/operator bleeding on diarization errors.
              // If it's the exact same utterance (checked above), it updates. Otherwise, it creates a new bubble.
              if (false) {
              } else {
                nextTurns.push({`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', content);
