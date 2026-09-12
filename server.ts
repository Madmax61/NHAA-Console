import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'ok'}));

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 600000 } });
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// Helper: robust Gemini generation with retry and multi-model fallback
async function generateContentWithFallback(options: {
  models: string[];
  contents: any;
  config?: any;
  maxRetriesPerModel?: number;
}) {
  const { models, contents, config, maxRetriesPerModel = 2 } = options;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: { ...config, httpOptions: { timeout: 600000 } },
        });
        let text = '';
        for await (const chunk of stream) {
          if (chunk.text) {
            text += chunk.text;
          }
        }
        
        if (!text || text.trim() === '') {
          throw new Error(`Model ${model} returned empty text`);
        }
        
        return { text };
      } catch (err: any) {
        lastError = err;
        
        if (err?.status === 400) {
          console.log(`Model ${model} returned 400 Bad Request. Aborting fallback as the input is invalid.`);
          throw err;
        }

        const msg = (err?.message || '').toLowerCase();
        const isRetryable =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('quota') ||
          msg.includes('rate limit') ||
          msg.includes('resource exhausted') ||
          msg.includes('aborted') ||
          msg.includes('timeout') ||
          msg.includes('fetch failed');

        if (isRetryable && attempt < maxRetriesPerModel - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1) + Math.random() * 200));
          continue;
        }
        // If not retryable or retries exhausted for this model, fallback to next model
        break;
      }
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// REST Endpoint: Analyze Transcript
// -------------------------------------------------------------
app.post('/api/analyze', async (req, res) => {
  try {
    const { turns, sourceLanguage } = req.body;
    if (!turns || turns.length === 0) {
      return res.json({ riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', translatedTurns: [] });
    }

    const transcriptText = turns.map((t: any, index: number) => `[Turn ${index}] ${t.speaker}: ${t.text}`).join('\n');
    
    const targetLangInstruction = sourceLanguage && sourceLanguage !== 'auto' && sourceLanguage !== 'multi' ? `\n    The expected caller language is: ${sourceLanguage}. Ensure 'correctedOriginals' are strictly output in the native script of this expected language (e.g., if 'bn' or Bengali is expected, use Bengali script 'বাংলা' and NEVER Hindi 'हिन्दी' or Roman alphabet).` : '';

    const prompt = `
    You are an emergency CAD operator AI assistant. Analyze this ongoing conversation transcript.
    CRITICAL: The transcript comes from a live Speech-to-Text engine that frequently mishears foreign languages (e.g. Hindi, Bengali) as phonetically similar English words (e.g., mishearing "bolie" as "ball", or "dikkat hai" as "done facility", or "shuru" as "started"). 
    You must intelligently detect these phonetic hallucinations based on the conversational context, reconstruct the actual intended foreign phrase, output the correct native script in 'correctedOriginals', and provide the accurate English translation in 'translations'.${targetLangInstruction}
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.
    
    Output your analysis as a strict JSON object with this shape:
    {
      "caseTitle": string (e.g. "Domestic Disturbance", "Medical Emergency", "Robbery", max 3-4 words summarizing the call),
      "riskScore": number (0-100),
      "signals": [] (short list of danger signals detected, e.g., [{"category": "WEAPON", "keyword": "knife", "description": "Weapon mentioned"}]),
      "recommendedActions": string[] (e.g., ["Dispatch Police", "Mark Critical"]),
      "suggestedQuestions": string[] (e.g., ["Are you in a safe room?"]),
      "callerStatus": string (e.g., "In Danger", "Distressed"),
      "locationStatus": string ("unknown", "approximate", "known"),
      "extractedLocation": string | null (exact address or description of the location mentioned in the call. IMPORTANT: MUST be translated to English if spoken in a foreign language. e.g. "247 Mineral Falls Avenue"),
      "detectedLanguage": string | null (name of the primary language being spoken by the caller, e.g. "Hindi", "Marathi", "English"),
      "translations": { 
         "0": "English translation for [Turn 0] if not English",
         "1": "..."
      },
      "correctedOriginals": {
         "0": "If the original transcript contains phonetic/Romanized foreign words OR English hallucinations (e.g. 'ball' instead of 'bolie'), output the completely reconstructed and corrected native script (e.g. 'बोलिए'). Only include turns that need correction.",
         "1": "..."
      }
    }
    
    Transcript:
    ${transcriptText}
    `;

    let parsedReport = {
      riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', extractedLocation: null, detectedLanguage: null, translations: {}, correctedOriginals: {}
    };

    try {
      const response = await generateContentWithFallback({
        models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest'],
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let fullOutput = response.text || "{}";

      const jsonMatch = fullOutput.match(/```json\s*([\s\S]*?)\s*```/) || fullOutput.match(/([\{\[][\s\S]*[\}\]])/);
      if (jsonMatch) {
        try {
          parsedReport = JSON.parse(jsonMatch[1]);
        } catch (err) {}
      } else {
        try {
          parsedReport = JSON.parse(fullOutput);
        } catch (err) {}
      }
    } catch (apiError: any) {
      console.log("Analysis API temporary fallback:", apiError?.message || "Temporarily unavailable");
      // Return the fallback report so the UI doesn't crash
      return res.json(parsedReport);
    }
    
    res.json(parsedReport);
  } catch (error: any) {
    console.error('Analysis Endpoint Error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to analyze transcript' });
  }
});

// -------------------------------------------------------------
// REST Endpoint: File Upload Transcription (Using Gemini 1.5 Pro)
// -------------------------------------------------------------
app.post('/api/transcribe_file', upload.single('file'), async (req, res) => {
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
    filePath = file.path;

    if (process.env.GEMINI_API_KEY) {
      console.log("Transcribing via Gemini (Inline Base64)...");
      
      const fileBuffer = fs.readFileSync(file.path);
      const base64Data = fileBuffer.toString('base64');
      
      const prompt = `
      Listen to this emergency audio file and provide a highly accurate, word-for-word transcript.

      CRITICAL INSTRUCTIONS:
      1. DIARIZATION (MANDATORY): You MUST separate the transcript into alternating turns between the dispatcher ('Operator') and the other person ('Caller'). Do NOT group multiple speakers into a single turn! Every time a different person speaks, you must create a new object in the JSON array.
      2. NATIVE SCRIPT: Transcribe exactly what is spoken in its native script. We expect languages like English, Hindi (हिन्दी), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), and Punjabi (ਪੰਜਾਬੀ). Do not translate spoken words into English.
      3. CODE-SWITCHING: If they switch languages mid-sentence, capture these switches perfectly using the correct scripts.
      4. OUTPUT FORMAT: Output ONLY a JSON array. Each object in the array must have these fields:
         - speaker (string, 'Operator' or 'Caller')
         - start (number)
         - end (number)
         - text (string, the transcript)
         - isFinal (boolean, always true)
         - language (string, e.g. 'English', 'Marathi', 'Mixed')
      `;
      
      let response;
      try {
        console.log("Requesting transcription from Gemini...");
        response = await generateContentWithFallback({
          models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'],
          contents: { parts: [
            { inlineData: { data: base64Data, mimeType: file.mimetype || 'audio/mpeg' } },
            { text: prompt }
          ] },
          config: {
            responseMimeType: "application/json"
          }
        });
      } catch (e: any) {
        console.error("generateContentWithFallback failed:", e);
        throw e;
      }
      
      let turns: any = [];
      try {
        let outText = response.text || "[]";
        console.log("Raw Gemini Transcription Output:", outText);
        
        let parsed = null;
        const jsonBlockMatch = outText.match(/```json\s*([\s\S]*?)\s*```/);
        const arrayMatch = outText.match(/(\[\s*\{[\s\S]*\}\s*\])/);
        const objectMatch = outText.match(/(\{\s*"[\s\S]*\}\s*)/);
        
        if (jsonBlockMatch) {
          try { parsed = JSON.parse(jsonBlockMatch[1]); } catch(e) {}
        }
        if (!parsed && arrayMatch) {
          try { parsed = JSON.parse(arrayMatch[1]); } catch(e) {}
        }
        if (!parsed && objectMatch) {
          try { parsed = JSON.parse(objectMatch[1]); } catch(e) {}
        }
        if (!parsed) {
          try { parsed = JSON.parse(outText); } catch(e) {}
        }

        if (parsed) {
          if (Array.isArray(parsed)) {
            turns = parsed;
          } else if (parsed.turns && Array.isArray(parsed.turns)) {
            turns = parsed.turns;
          } else if (parsed.transcript && Array.isArray(parsed.transcript)) {
            turns = parsed.transcript;
          } else {
            turns = [parsed];
          }
        } else {
            console.error("Could not extract any JSON from the response.");
            throw new Error(`Failed to parse transcription response. Raw output: ${outText.substring(0, 100)}...`);
        }
      } catch (e: any) {
        console.error("Failed to parse Gemini transcription JSON:", e);
        clearInterval(heartbeat);
        res.write(JSON.stringify({ error: "Failed to parse transcription from Gemini. Output might not be valid JSON.", turns: [] }));
        return res.end();
      }
      
      console.log(`Sending response to client with ${turns.length} turns.`);
      clearInterval(heartbeat);
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
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
    if (uploadRes && uploadRes.name) {
      try {
        await ai.files.delete({ name: uploadRes.name });
      } catch (e) {}
    }
  }
});

// -------------------------------------------------------------
// HTTP / Vite integration setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // -------------------------------------------------------------
  // WebSocket Server Setup for Live Transcription
  // -------------------------------------------------------------
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url?.startsWith('/ws/transcribe')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, request) => {
    console.log("Client connected to", request.url);
    
    let targetLanguage = 'multi';
    try {
      if (request.url) {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const langParam = url.searchParams.get('language');
        if (langParam && langParam !== 'auto') {
          targetLanguage = langParam;
        }
      }
    } catch (e) {
      console.error("Error parsing WS URL:", e);
    }

    let dgWs: WebSocket | null = null;

    if (!DEEPGRAM_API_KEY) {
      console.log("WARNING: DEEPGRAM_API_KEY not set. Sending mock data.");
      ws.on('message', (msg) => {
         ws.send(JSON.stringify({
            turns: [{
               speaker: "Operator",
               start: 0.0,
               end: 1.0,
               text: "Live transcription requires Deepgram API key.",
               isFinal: true
            }]
         }));
      });
      return;
    }

    try {
      let dgUrl = '';
      if (targetLanguage === 'en' || targetLanguage === 'en-US' || targetLanguage === 'multi') {
        dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${targetLanguage}&smart_format=true&diarize=true&interim_results=true&endpointing=300&encoding=linear16&sample_rate=16000`;
      } else {
        dgUrl = `wss://api.deepgram.com/v1/listen?model=general&tier=nova-3&language=${targetLanguage}&smart_format=true&diarize=true&interim_results=true&endpointing=300&encoding=linear16&sample_rate=16000`;
      }
      console.log("Connecting to Deepgram with URL:", dgUrl);
      dgWs = new WebSocket(dgUrl, {
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`
        }
      });

      dgWs.on('open', () => {
        console.log("Connected to Deepgram");
      });

      dgWs.on('message', (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.channel) {
            const alts = msg.channel.alternatives[0];
            const words = alts.words || [];
            const is_final = msg.is_final || false;

            const turns: any[] = [];
            let current_turn: any = null;

            for (const w of words) {
              const speaker_id = w.speaker || 0;
              const speaker = speaker_id === 0 ? "Operator" : "Caller";

              if (current_turn && current_turn.speaker === speaker) {
                current_turn.text += ` ${w.punctuated_word || w.word}`;
                current_turn.end = w.end;
              } else {
                if (current_turn) turns.push(current_turn);
                current_turn = {
                  speaker: speaker,
                  start: w.start,
                  end: w.end,
                  text: w.punctuated_word || w.word,
                  isFinal: is_final
                };
              }
            }
            if (current_turn) turns.push(current_turn);

            if (turns.length > 0) {
              ws.send(JSON.stringify({ turns }));
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      });

      dgWs.on('close', () => console.log("Deepgram closed"));
      dgWs.on('error', (err) => console.error("Deepgram error:", err));

    } catch (err) {
      console.error("Failed to connect to Deepgram", err);
    }

    ws.on('message', (message) => {
      if (dgWs && dgWs.readyState === WebSocket.OPEN) {
        dgWs.send(message);
      }
    });

    ws.on('close', () => {
      console.log("Client disconnected");
      if (dgWs && dgWs.readyState === WebSocket.OPEN) {
        dgWs.close();
      }
    });
  });
}

startServer();
