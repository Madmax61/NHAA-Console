const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });',
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 300000 } });'
);

const oldRetry = `        const isRetryable =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('quota') ||
          msg.includes('rate limit') ||
          msg.includes('resource exhausted');`;

const newRetry = `        const isRetryable =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('quota') ||
          msg.includes('rate limit') ||
          msg.includes('resource exhausted') ||
          msg.includes('aborted') ||
          msg.includes('timeout') ||
          msg.includes('fetch failed');`;

content = content.replace(oldRetry, newRetry);

fs.writeFileSync('server.ts', content);
