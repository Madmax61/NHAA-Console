const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `      const data = await res.json();
      
      const localAudioUrl = URL.createObjectURL(file);`;

const newCode = `      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      const localAudioUrl = URL.createObjectURL(file);`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', content);
