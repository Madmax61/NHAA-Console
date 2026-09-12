const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                <div className="h-2 w-full bg-[var(--bg-panel)] border border-[var(--border)]">
                  <div className={\`h-full \${riskScore >= 90 ? 'bg-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)]' : 'bg-[var(--info-tag)]'}\`} style={{ width: \`\${riskScore}%\` }}></div>
                </div>`;

const replacement = `                <div className="h-2 w-full bg-[var(--bg-panel)] border border-[var(--border)]">
                  <div className={\`h-full \${riskScore >= 90 ? 'bg-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)]' : 'bg-[var(--info-tag)]'}\`} style={{ width: \`\${riskScore}%\` }}></div>
                </div>
                <div className="pt-2 flex justify-end">
                   <button onClick={() => setShowSviDetails(!showSviDetails)} className="flex items-center gap-1 text-[10px] uppercase text-[var(--info-tag)] hover:underline">
                      <Info className="w-3 h-3" /> How is this calculated?
                   </button>
                </div>
                {showSviDetails && (
                   <div className="mt-2 p-2 bg-[#1A2634] border border-[var(--border)] text-[10px] space-y-2 relative">
                      <button onClick={() => setShowSviDetails(false)} className="absolute top-1 right-1 text-[var(--text-secondary)] hover:text-white"><XCircle className="w-3 h-3" /></button>
                      <div className="font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-1 mb-1">SVI Calculation Factors</div>
                      <div>
                         <span className="text-[var(--text-secondary)]">Detected Risk Signals:</span>
                         <ul className="list-disc pl-4 mt-1 text-[var(--high)]">
                           {riskSignals && riskSignals.length > 0 ? riskSignals.map((s: any, i: number) => (
                              <li key={i}>{typeof s === 'string' ? s : s.category || s.keyword}</li>
                           )) : <li>None</li>}
                         </ul>
                      </div>
                      <div>
                         <span className="text-[var(--text-secondary)]">Emotional Factors (Contextual):</span>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {analysis.emotionalFactors && analysis.emotionalFactors.length > 0 ? analysis.emotionalFactors.map((ef: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm text-[var(--text-primary)]">{ef}</span>
                           )) : <span className="italic text-[var(--text-secondary)]">Analyzing...</span>}
                         </div>
                      </div>
                   </div>
                )}
`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
console.log('Patched SVI');
