const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `"riskScore": number (0-100),`;
const newTarget = `"caseTitle": string (e.g. "Domestic Disturbance", "Medical Emergency", "Robbery", max 3-4 words summarizing the call),
      "riskScore": number (0-100),`;

content = content.replace(target, newTarget);
fs.writeFileSync('server.ts', content);
