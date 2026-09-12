const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex gap-4 mt-4 h-full min-h-0 overflow-hidden">.*?(?=    <\/div>\n  \);\n\})/s;

const newAuditContent = `<div className="flex gap-4 mt-4 h-full min-h-0 overflow-hidden">
        {/* Audio / Technical Meta */}
        <div className="w-1/2 flex flex-col gap-4">
          
          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Original Audio Recording
            </h3>
            
            {/* Fake Waveform based on ID */}
            <div className="h-16 w-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center overflow-hidden px-1 space-x-[2px]">
              {Array.from({ length: 60 }).map((_, i) => {
                 const h = (Math.sin(i * 0.5 + currentCase.id.charCodeAt(0)) * 40) + 50 + (Math.random() * 10);
                 return <div key={i} className="w-1 bg-[var(--info-tag)]" style={{ height: \`\${h}%\`, opacity: currentCase.status === 'RESOLVED' ? 0.3 : (i < 30 ? 1 : 0.3) }}></div>;
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2">
              <div>
                <div className="text-[var(--text-secondary)]">Duration</div>
                <div>{currentCase.turns && currentCase.turns.length > 0 ? \`00:\${Math.floor(currentCase.turns.length * 2.5).toString().padStart(2, '0')}\` : '00:00'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Format</div>
                <div>PCM / 16kHz / Mono</div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-3">
             <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <FileDigit className="w-4 h-4" /> Cryptographic Signatures
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Audio File SHA-256</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] break-all select-all">
                  {currentCase.fileHash || 'Pending Capture...'}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Transcript Version</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)]">
                  {currentCase.status === 'RESOLVED' ? 'v1.0.0-final (Locked)' : 'Live Streaming (Mutable)'}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">AI Model Checksum</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)]">
                  gemini-1.5-pro-001 ({currentCase.id.substring(currentCase.id.length - 4)})
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Audit Log */}
        <div className="w-1/2 flex flex-col border border-[var(--border)] bg-[var(--bg-main)]">
           <div className="bg-[#25394B] p-3 border-b border-[var(--border)] font-bold text-xs uppercase flex items-center gap-2">
             <FileText className="w-4 h-4 text-[var(--info-tag)]" />
             System Audit Log
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              
              {currentCase.auditLog && currentCase.auditLog.map((log: any, idx: number) => {
                let colorClass = 'text-[var(--info-tag)]';
                if (log.type === 'operator') colorClass = 'text-[var(--text-secondary)]';
                if (log.type === 'ai') colorClass = 'text-[var(--high)]';
                if (log.type === 'alert') colorClass = 'text-[var(--critical)]';

                return (
                  <div key={idx} className="flex gap-4">
                    <span className="text-[var(--text-secondary)] w-24 shrink-0">{log.time}</span>
                    <span className={\`\${colorClass} w-24 shrink-0\`}>[{log.actor}]</span>
                    <span className="text-[var(--text-primary)]">{log.message}</span>
                  </div>
                );
              })}

              {currentCase.analysis && currentCase.analysis.riskScore > 0 && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--high)] w-24 shrink-0">[AI_ENGINE]</span>
                  <span className="text-[var(--text-primary)]">Real-time risk assessment active. Score: {currentCase.analysis.riskScore}</span>
                </div>
              )}

              {currentCase.analysis && currentCase.analysis.riskScore > 80 && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--critical)] w-24 shrink-0">[ALERT]</span>
                  <span className="text-[var(--text-primary)]">Critical Risk Detected.</span>
                </div>
              )}

              {currentCase.status === 'RESOLVED' && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">[OPERATOR]</span>
                  <span className="text-[var(--text-primary)]">Case officially closed and locked.</span>
                </div>
              )}

           </div>
        </div>

      </div>`;

content = content.replace(regex, newAuditContent);
fs.writeFileSync('src/App.tsx', content);
console.log('Patched EvidenceAuditView.');
