const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const injection = `
  const [operatorNote, setOperatorNote] = useState('');
  const [showSviDetails, setShowSviDetails] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRecommendedAction = (action: string) => {
    setToastMessage(\`Action Taken: \${action}\`);
    setTimeout(() => setToastMessage(null), 3000);
    
    if (currentCase) {
      const newLog = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        type: 'alert',
        actor: 'OP-01',
        message: \`Recommended Action Taken: \${action}\`
      };
      updateCase(currentCase.id, {
        auditLog: [...(currentCase.auditLog || []), newLog]
      });
    }
  };

  const handleOperatorNoteSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!operatorNote.trim() || !currentCase) return;
      
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
      
      updateCase(currentCase.id, {
        auditLog: [...(currentCase.auditLog || []), newLog],
        turns: [...(currentCase.turns || []), newTurn]
      });
      
      setTurns(prev => [...prev, newTurn]);
      setOperatorNote('');
    }
  };
`;

const target = "const [sourceLanguage, setSourceLanguage] = useState<string>('auto');";
app = app.replace(target, target + "\n" + injection);
fs.writeFileSync('src/App.tsx', app);
