const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/metaData: any;\n\};/, "metaData: any;\n  auditLog?: any[];\n  fileHash?: string;\n  duration?: string;\n  audioUrl?: string;\n};");

fs.writeFileSync('src/App.tsx', content);
