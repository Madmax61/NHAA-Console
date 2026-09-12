const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldGen = `        const response = await ai.models.generateContent({
          model,
          contents,
          config: { ...config, httpOptions: { timeout: 300000 } },
        });
        return response;`;

const newGen = `        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: { ...config, httpOptions: { timeout: 600000 } },
        });
        let text = '';
        for await (const chunk of stream) {
          text += chunk.text;
        }
        return { text };`;

content = content.replace(oldGen, newGen);

const oldInit = `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 300000 } });`;
const newInit = `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 600000 } });`;

content = content.replace(oldInit, newInit);

const oldUpload = `uploadRes = await ai.files.upload({
        file: file.path,
        config: { 
           mimeType: file.mimetype || 'audio/mpeg',
           httpOptions: { timeout: 300000 }
        }
      });`;

const newUpload = `uploadRes = await ai.files.upload({
        file: file.path,
        config: { 
           mimeType: file.mimetype || 'audio/mpeg',
           httpOptions: { timeout: 600000 }
        }
      });`;

content = content.replace(oldUpload, newUpload);

fs.writeFileSync('server.ts', content);
