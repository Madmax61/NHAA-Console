const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Update textarea
const oldTextarea = `<textarea \n                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"\n                placeholder="Enter operator notes here... (Time-stamped on submit)"\n              ></textarea>`;
const newTextarea = `<textarea \n                value={operatorNote}\n                onChange={(e) => setOperatorNote(e.target.value)}\n                onKeyDown={handleOperatorNoteSubmit}\n                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"\n                placeholder="Enter operator notes here... (Press Enter to submit, Shift+Enter for new line)"\n              ></textarea>`;
app = app.replace(oldTextarea, newTextarea);

// Update recommended actions
const oldRecAction = `<button key={i} className={\`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 \${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}\`}>\n                       {action}\n                     </button>`;
const newRecAction = `<button key={i} onClick={() => handleRecommendedAction(action)} className={\`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 \${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}\`}>\n                       {action}\n                     </button>`;
app = app.replace(oldRecAction, newRecAction);

fs.writeFileSync('src/App.tsx', app);
console.log('Patched UI elements');
