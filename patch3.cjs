const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldTextarea = `<textarea 
                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"
                placeholder="Enter operator notes here... (Time-stamped on submit)"
              ></textarea>`;

const newTextarea = `<textarea 
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                onKeyDown={handleOperatorNoteSubmit}
                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"
                placeholder="Enter operator notes here... (Press Enter to submit, Shift+Enter for new line)"
              ></textarea>`;

app = app.replace(oldTextarea, newTextarea);

const oldRecAction = `<button key={i} className={\`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 \${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}\`}>
                       {action}
                     </button>`;

const newRecAction = `<button key={i} onClick={() => handleRecommendedAction(action)} className={\`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 \${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}\`}>
                       {action}
                     </button>`;

app = app.replace(oldRecAction, newRecAction);

fs.writeFileSync('src/App.tsx', app);
