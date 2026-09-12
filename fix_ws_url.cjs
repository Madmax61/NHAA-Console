const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix the backend URL parsing
content = content.replace(
  "const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/transcribe';",
  "const baseUrl = backendUrl.replace(/\\/$/, '');\n      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/transcribe';"
);

// Better error handling for WS
const oldOnError = `      ws.onerror = (e) => {
          setRawError('WebSocket connection error.');
          stopListening();
      };
      
      ws.onclose = () => {
          setIsConnected(false);
          stopListening();
      };`;

const newOnError = `      ws.onerror = (e) => {
          console.error("WebSocket error:", e);
          setRawError('WebSocket connection error. Check backend logs or ngrok warning.');
          stopListening();
      };
      
      ws.onclose = (e) => {
          console.log("WebSocket closed", e.code, e.reason);
          setIsConnected(false);
          stopListening();
      };`;

content = content.replace(oldOnError, newOnError);

fs.writeFileSync('src/App.tsx', content);
