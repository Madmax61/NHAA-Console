const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldWsUrl = `      const baseUrl = backendUrl.replace(/\\/$/, '');
      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/transcribe';
      const ws = new WebSocket(wsUrl);`;

const newWsUrl = `      if (!backendUrl || backendUrl.trim() === '') {
        throw new Error("Backend URL is empty. Please enter your ngrok URL.");
      }
      let wsUrl = '';
      try {
        const parsedUrl = new URL(backendUrl);
        parsedUrl.protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        parsedUrl.pathname = '/ws/transcribe';
        wsUrl = parsedUrl.toString();
      } catch (e) {
        // Fallback if URL parsing fails (e.g. they forgot https://)
        const cleanUrl = backendUrl.replace(/\\/$/, '').replace(/^http/, 'ws');
        wsUrl = (cleanUrl.startsWith('ws') ? cleanUrl : 'wss://' + cleanUrl) + '/ws/transcribe';
      }
      
      console.log("Connecting WebSocket to:", wsUrl);
      const ws = new WebSocket(wsUrl);`;

content = content.replace(oldWsUrl, newWsUrl);
fs.writeFileSync('src/App.tsx', content);
