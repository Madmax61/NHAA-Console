const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex items-center gap-2 px-3 py-1 bg-\[var\(--bg-main\)\] border border-\[var\(--border\)\] text-xs font-mono">\s*<Fingerprint className="w-4 h-4 text-\[var\(--info-tag\)\]" \/>\s*CHAIN OF CUSTODY VERIFIED\s*<\/div>/;

const replacement = `<div className="flex gap-2">
          <button onClick={() => {
             if (!currentCase.turns) return;
             const text = currentCase.turns.map((t: any) => \`[\${t.speaker || 'Unknown'}] \${t.text}\`).join('\\n');
             const blob = new Blob([text], { type: 'text/plain' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = \`\${currentCase.id}-transcript.txt\`;
             a.click();
          }} className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-xs font-mono hover:bg-[var(--border)] hover:text-white transition-colors cursor-pointer">
             <FileText className="w-4 h-4" />
             EXPORT TRANSCRIPT
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-xs font-mono">
             <Fingerprint className="w-4 h-4 text-[var(--info-tag)]" />
             CHAIN OF CUSTODY VERIFIED
          </div>
        </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
