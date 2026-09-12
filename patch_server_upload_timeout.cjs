const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldUpload = `uploadRes = await ai.files.upload({
        file: file.path,
        config: { mimeType: file.mimetype || 'audio/mpeg' }
      });`;

const newUpload = `uploadRes = await ai.files.upload({
        file: file.path,
        config: { 
           mimeType: file.mimetype || 'audio/mpeg',
           httpOptions: { timeout: 300000 }
        }
      });`;

content = content.replace(oldUpload, newUpload);

const oldGen = `const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });`;

const newGen = `const response = await ai.models.generateContent({
          model,
          contents,
          config: { ...config, httpOptions: { timeout: 300000 } },
        });`;

content = content.replace(oldGen, newGen);

fs.writeFileSync('server.ts', content);
