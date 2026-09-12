const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldDelete = /const deleteCase = \(id: string\) => \{\s*setCases\(prev => prev\.filter\(c => c\.id !== id\)\);\s*if \(selectedCaseId === id\) \{\s*setSelectedCaseId\(null\);\s*\}\s*\};/s;

const newDelete = `const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedCaseId === id) {
      setSelectedCaseId(null);
      setActiveTab('QUEUE');
    }
  };`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('src/App.tsx', content);
