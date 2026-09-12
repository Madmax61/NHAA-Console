const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldButton = `<button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--bg-main)] hover:bg-[var(--info-tag)] text-white border border-[var(--border)] transition-colors rounded-full"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>`;

const newButton = `<button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--bg-main)] hover:bg-[var(--info-tag)] text-[var(--text-primary)] border border-[var(--border)] transition-colors rounded-full"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
      </button>`;

content = content.replace(oldButton, newButton);

// Also we need to import Play and Pause if not already imported
if (!content.includes('Play,') && !content.includes(', Play')) {
    content = content.replace('import {', 'import { Play, Pause,');
}

fs.writeFileSync('src/App.tsx', content);
