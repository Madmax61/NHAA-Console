const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldCode = `                {riskSignals.length > 0 ? (
                  riskSignals.map((sig: string, i: number) => (
                    <div key={i} className="flex gap-2 p-1 border-b border-[var(--border)] text-[var(--text-primary)]">
                      <span className="text-[var(--critical)] shrink-0">⚠</span>
                      <span>{sig}</span>
                    </div>
                  ))
                ) : (`;

const newCode = `                {riskSignals.length > 0 ? (
                  riskSignals.map((sig: any, i: number) => (
                    <div key={i} className="flex gap-2 p-1 border-b border-[var(--border)] text-[var(--text-primary)]">
                      <span className="text-[var(--critical)] shrink-0">⚠</span>
                      <span>{typeof sig === 'string' ? sig : \`\${sig.keyword || sig.category}: \${sig.description || ''}\`}</span>
                    </div>
                  ))
                ) : (`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', content);
