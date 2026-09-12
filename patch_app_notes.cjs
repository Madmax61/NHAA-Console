const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Info to lucide-react imports if not present
if (!app.includes('Info,')) {
    app = app.replace("} from 'lucide-react';", "Info,\n} from 'lucide-react';");
}

// 2. Add toastMessage state and operatorNote state
if (!app.includes('const [toastMessage, setToastMessage]')) {
    app = app.replace(
        "const [activeTab, setActiveTab] = useState<'QUEUE' | 'ACTIVE' | 'AUDIT'>('QUEUE');",
        "const [activeTab, setActiveTab] = useState<'QUEUE' | 'ACTIVE' | 'AUDIT'>('QUEUE');\n  const [toastMessage, setToastMessage] = useState<string | null>(null);\n  const [operatorNote, setOperatorNote] = useState('');\n  const [showSviDetails, setShowSviDetails] = useState(false);"
    );
}

// 3. Add handleRecommendedAction
const actionHandler = `
  const handleRecommendedAction = (action: string) => {
    setToastMessage(\`Action Taken: \${action}\`);
    setTimeout(() => setToastMessage(null), 3000);
    
    if (selectedCase) {
      const newLog = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        type: 'alert',
        actor: 'OP-01',
        message: \`Recommended Action Taken: \${action}\`
      };
      updateCase(selectedCase.id, {
        auditLog: [...(selectedCase.auditLog || []), newLog]
      });
    }
  };

  const handleOperatorNoteSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!operatorNote.trim() || !selectedCase) return;
      
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
      
      const newLog = {
        time: timeStr,
        type: 'operator',
        actor: 'OP-01',
        message: \`Note: \${operatorNote.trim()}\`
      };
      
      const newTurn = {
        id: Date.now() + Math.random(),
        speaker: 'SYSTEM',
        start: 0,
        end: 0,
        timestamp: timeStr,
        text: '*Operator added a note*',
        isFinal: true,
        isNote: true,
        fullNote: operatorNote.trim()
      };
      
      updateCase(selectedCase.id, {
        auditLog: [...(selectedCase.auditLog || []), newLog],
        turns: [...(selectedCase.turns || []), newTurn]
      });
      
      // Also update local turns state to re-render immediately
      setTurns(prev => [...prev, newTurn]);
      
      setOperatorNote('');
    }
  };
`;

if (!app.includes('handleRecommendedAction')) {
    app = app.replace(
        "const createNewCase = () => {",
        actionHandler + "\n  const createNewCase = () => {"
    );
}

fs.writeFileSync('src/App.tsx', app);
console.log('Patched states and handlers');
