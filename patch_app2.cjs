const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Icons
content = content.replace(/import\s*\{\s*/, 'import {\n  Trash2,\n  Plus,\n');

// 2. Add deleteCase to App
const updateCaseRegex = /const updateCase = \(id: string, updates: Partial<Case>\) => \{.*?\};\n/s;
content = content.replace(updateCaseRegex, match => {
  return match + `
  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedCaseId === id) {
      setSelectedCaseId(null);
    }
  };
`;
});

// 3. Update App render for CaseQueueView and remove New Call button from header
content = content.replace(/<CaseQueueView cases={cases} selectedCaseId={selectedCaseId} setSelectedCaseId={setSelectedCaseId} \/>/, '<CaseQueueView cases={cases} selectedCaseId={selectedCaseId} setSelectedCaseId={setSelectedCaseId} createNewCase={createNewCase} deleteCase={deleteCase} />');

const headerNewCallRegex = /<button\s+onClick=\{createNewCase\}\s+className="ml-4 px-6 py-1\.5 text-xs font-bold uppercase tracking-wider bg-\[var\(--info-tag\)\] text-black hover:bg-white transition-colors"\s*>\s*\+\s*NEW\s*CALL\s*<\/button>/s;
content = content.replace(headerNewCallRegex, '');

// 4. Update CaseQueueView
const caseQueueDefRegex = /function CaseQueueView\(\{ cases, selectedCaseId, setSelectedCaseId \}: \{ cases: Case\[\], selectedCaseId: string \| null, setSelectedCaseId: \(id: string\) => void \}\) \{/s;
content = content.replace(caseQueueDefRegex, 'function CaseQueueView({ cases, selectedCaseId, setSelectedCaseId, createNewCase, deleteCase }: { cases: Case[], selectedCaseId: string | null, setSelectedCaseId: (id: string) => void, createNewCase: () => void, deleteCase: (id: string) => void }) {');

// CaseQueueView empty state update
const emptyStateRegex = /<p className="text-xs mt-2">Click "\+ NEW CALL" to start a session\.<\/p>/s;
content = content.replace(emptyStateRegex, `<p className="text-xs mt-2 text-center">Click the circular + button below to start a session.</p>
          <button onClick={createNewCase} className="mt-6 w-12 h-12 rounded-full bg-[var(--info-tag)] text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg shadow-black/50">
            <Plus className="w-6 h-6" />
          </button>`);

// CaseQueueView list rendering update
const mapEndRegex = /<\/div>\s*<\/button>\s*\)\)\}\s*<\/div>/s;
content = content.replace(mapEndRegex, `</div>
          <div className="flex items-center px-3" onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}>
            <button className="text-[var(--text-secondary)] hover:text-[var(--critical)] p-2 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </button>
      ))}
      <div className="flex justify-center mt-4 pb-8">
        <button onClick={createNewCase} className="w-12 h-12 rounded-full bg-[var(--info-tag)] text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg shadow-black/50 hover:scale-105 active:scale-95 duration-200">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>`);


// 5. Update EvidenceAuditView waiting state
const auditStartRegex = /function EvidenceAuditView\(\{ currentCase, updateCase \}: \{ currentCase: any, updateCase: \(id: string, updates: any\) => void \}\) \{.*?(?=return \()/s;

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

content = content.replace(auditStartRegex, newAuditStart);

fs.writeFileSync('src/App.tsx', content);
console.log('Patch complete.');
