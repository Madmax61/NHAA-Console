const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The messed up part starts at EvidenceAuditView and goes to the second `return (` which is around line 1197.
const messedUpRegex = /function EvidenceAuditView\(\{ currentCase, updateCase \}: \{ currentCase: any, updateCase: \(id: string, updates: any\) => void \}\) \{.*?(?=  return \(\n    <div className="flex flex-col h-full gap-2 p-2 bg-\[var\(--bg-panel\)\])/s;

const newAuditStart = `function EvidenceAuditView({ currentCase, updateCase }: { currentCase: any, updateCase: (id: string, updates: any) => void }) {
    if (!currentCase) {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <Fingerprint className="w-16 h-16 mb-4 opacity-20" />
          <p>No case selected for audit.</p>
        </div>
      );
    }

    const hasData = (currentCase.turns && currentCase.turns.length > 0) || (currentCase.analysis && Object.keys(currentCase.analysis).length > 0 && currentCase.analysis.riskScore > 0);
    
    if (!hasData && currentCase.status !== 'RESOLVED') {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <Activity className="w-12 h-12 mb-4 opacity-30 animate-pulse" />
          <p className="text-lg">Waiting for Call Analytics...</p>
          <p className="text-xs mt-2 opacity-60">Begin the active call recording to populate audit data.</p>
        </div>
      );
    }

`;

content = content.replace(messedUpRegex, newAuditStart);
fs.writeFileSync('src/App.tsx', content);
