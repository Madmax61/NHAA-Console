const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldEndpointStart = `app.post('/api/transcribe_file', upload.single('file'), async (req, res) => {
  let uploadRes: any = null;
  let filePath: string | null = null;
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    filePath = file.path;`;

const newEndpointStart = `app.post('/api/transcribe_file', upload.single('file'), async (req, res) => {
  let uploadRes: any = null;
  let filePath: string | null = null;
  
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // Start heartbeat to prevent proxy timeout on long-running transcription
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  const heartbeat = setInterval(() => {
    res.write(' ');
  }, 15000);

  try {
    filePath = file.path;`;

content = content.replace(oldEndpointStart, newEndpointStart);

const oldEndpointEnd = `      return res.json({ turns });
    } else {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
    }
  } catch (error: any) {
    console.error("Transcription Error:", error);
    return res.status(500).json({ error: error.message || "Failed to transcribe file", turns: [] });
  } finally {
    if (filePath && fs.existsSync(filePath)) {`;

const newEndpointEnd = `      clearInterval(heartbeat);
      res.write(JSON.stringify({ turns }));
      return res.end();
    } else {
      clearInterval(heartbeat);
      res.write(JSON.stringify({ error: "GEMINI_API_KEY is not set." }));
      return res.end();
    }
  } catch (error: any) {
    console.error("Transcription Error:", error);
    clearInterval(heartbeat);
    res.write(JSON.stringify({ error: error.message || "Failed to transcribe file", turns: [] }));
    return res.end();
  } finally {
    clearInterval(heartbeat);
    if (filePath && fs.existsSync(filePath)) {`;

content = content.replace(oldEndpointEnd, newEndpointEnd);

fs.writeFileSync('server.ts', content);
