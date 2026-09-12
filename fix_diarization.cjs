const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const toggleFunc = `  const toggleSpeaker = (idx: number) => {
    setTurns(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx].speaker = next[idx].speaker === 'Operator' ? 'Caller' : 'Operator';
      }
      return next;
    });
  };

  const renderTextWithHighlights`;

content = content.replace("  const renderTextWithHighlights", toggleFunc);

const oldSpan = `<span className="text-[var(--text-primary)] font-bold w-16 shrink-0 truncate" title={turn.speaker}>{turn.speaker}:</span>`;
const newSpan = `<span 
                    className="text-[var(--text-primary)] font-bold w-16 shrink-0 truncate cursor-pointer hover:text-[var(--info-tag)] hover:underline transition-colors" 
                    title="Click to correct speaker"
                    onClick={() => toggleSpeaker(idx)}
                  >
                    {turn.speaker}:
                  </span>`;

content = content.replace(oldSpan, newSpan);

fs.writeFileSync('src/App.tsx', content);
