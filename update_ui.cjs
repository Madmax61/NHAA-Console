const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace "Polling backend for turns..." with microphone indicator
content = content.replace(
  /Polling backend for turns\.\.\./,
  '<div className="flex flex-col items-center gap-2"><Mic className="w-8 h-8 text-[var(--critical)] animate-bounce" />Listening for live audio...</div>'
);

// Replace Start Listening button with proper Mic toggle
content = content.replace(
  /Press Start Listening to ingest from \{backendUrl\}\/transcribe/,
  'Press Start Listening to record and upload live audio'
);

// Also maybe add a Mic icon to the button if not there
content = content.replace(
  /<PlaySquare className="w-4 h-4" \/>\s*START LISTENING/,
  '<Mic className="w-4 h-4" />\n                    START LISTENING'
);

content = content.replace(
  /<Square className="w-4 h-4" \/>\s*STOP LISTENING/,
  '<MicOff className="w-4 h-4" />\n                    STOP LISTENING'
);

fs.writeFileSync('src/App.tsx', content);
