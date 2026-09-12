const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /return \(\s*<div className="flex flex-col h-full gap-2 min-h-0 overflow-hidden">\s*\{!currentCase && \(\s*<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-\[var\(--bg-main\)\] bg-opacity-90 backdrop-blur-sm">\s*<p className="text-\[var\(--text-secondary\)\] text-lg mb-4">No active case selected\.<\/p>\s*<button className="px-6 py-2 bg-\[var\(--info-tag\)\] text-black font-bold uppercase tracking-wider" onClick=\{.*?\}\>\s*Start New Call\s*<\/button>\s*<\/div>\s*\)\}/s;

content = content.replace(regex, `    if (!currentCase) {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <p className="text-[var(--text-secondary)] text-lg mb-4">No active case selected.</p>
          <button className="px-6 py-2 bg-[var(--info-tag)] text-black font-bold uppercase tracking-wider hover:bg-white transition-colors" onClick={() => document.querySelector('header button:last-child')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
            Start New Call
          </button>
        </div>
      );
    }
  
  return (
    <div className="flex flex-col h-full gap-2 min-h-0 overflow-hidden">`);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed ActiveCallView render.');
