const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update Case type to include auditLog and hash
content = content.replace(/metaData: any;\n\};/, `metaData: any;
  auditLog: { time: string, actor: string, type: 'system' | 'operator' | 'ai' | 'alert', message: string }[];
  fileHash?: string;
  duration?: string;
};`);

// 2. Update createNewCase
content = content.replace(/metaData: null\n\s*\};/, `metaData: null,
      auditLog: [
        { time: new Date().toLocaleTimeString('en-US', { hour12: false }), actor: 'SYSTEM', type: 'system', message: \`Inbound call received. Case \${newId} created.\` }
      ],
      fileHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };`);

// 3. We need to append to auditLog in ActiveCallView when important things happen, but for simplicity, we can just render the existing auditLog array + dynamic ones.
// Actually, let's just make EvidenceAuditView generate a deterministic auditLog based on the case data to save time and complexity, or just read \`currentCase.auditLog\`.
