import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow CORS so the React frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# You can use DEEPGRAM_API_KEY or GEMINI_KEY / GEMINI_API_KEY depending on your implementation preference
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_KEY") or os.getenv("GEMINI_API_KEY")

@app.websocket("/ws/transcribe")
async def transcribe_live(websocket: WebSocket):
    """
    Live Audio WebSocket Endpoint
    Used by 'START LISTENING' to transcribe microphone audio in real-time.
    """
    await websocket.accept()
    
    if not DEEPGRAM_API_KEY:
        print("WARNING: DEEPGRAM_API_KEY not set for live transcription.")
        # Minimal mock response if no API key is provided
        try:
            while True:
                data = await websocket.receive_bytes()
                # Dummy response
                await websocket.send_json({
                    "turns": [{
                        "speaker": "Operator",
                        "start": 0.0,
                        "end": 1.0,
                        "text": "Live transcription requires Deepgram API key.",
                        "isFinal": True
                    }]
                })
        except WebSocketDisconnect:
            pass
        return

    # Deepgram live connection
    try:
        import websockets
        dg_url = "wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize=true"
        async with websockets.connect(dg_url, extra_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"}) as dg_ws:
            
            async def sender():
                try:
                    while True:
                        data = await websocket.receive_bytes()
                        await dg_ws.send(data)
                except Exception:
                    pass

            async def receiver():
                try:
                    while True:
                        res = await dg_ws.recv()
                        msg = json.loads(res)
                        
                        if "channel" in msg:
                            alts = msg["channel"]["alternatives"][0]
                            words = alts.get("words", [])
                            is_final = msg.get("is_final", False)
                            
                            turns = []
                            current_turn = None
                            
                            for w in words:
                                speaker_id = w.get("speaker", 0)
                                speaker = "Operator" if speaker_id == 0 else "Caller"
                                
                                if current_turn and current_turn['speaker'] == speaker:
                                    current_turn['text'] += f" {w['punctuated_word']}"
                                    current_turn['end'] = w['end']
                                else:
                                    if current_turn:
                                        turns.append(current_turn)
                                    current_turn = {
                                        "speaker": speaker,
                                        "start": w['start'],
                                        "end": w['end'],
                                        "text": w['punctuated_word'],
                                        "isFinal": is_final
                                    }
                            if current_turn:
                                turns.append(current_turn)
                            
                            if turns:
                                await websocket.send_json({"turns": turns})
                except Exception:
                    pass
            
            await asyncio.gather(sender(), receiver())
            
    except Exception as e:
        print(f"Deepgram WS Error: {e}")
        try:
            await websocket.close()
        except:
            pass

@app.post("/api/transcribe_file")
async def transcribe_file(file: UploadFile = File(...)):
    """
    File Upload REST Endpoint
    Used by 'UPLOAD AUDIO' to transcribe a complete MP3/WAV file.
    Works as a dummy replacement for HF models using Gemini directly, 
    or uses Deepgram if preferred.
    """
    
    # Optional: Save file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        # Option 1: Use Gemini as a replacement for HF models
        if GEMINI_API_KEY:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            # Upload the audio file to Gemini
            gemini_file = client.files.upload(file=file_path)
            
            prompt = """
            Listen to this emergency audio file and provide a highly accurate transcript.
            Perform speaker diarization. Identify the primary speaker (dispatcher) as 'Operator' 
            and the secondary speaker as 'Caller'.
            Output ONLY a JSON array of turns in this exact format, with no markdown code blocks:
            [
                {"speaker": "Operator", "start": 0.0, "end": 2.5, "text": "Hello, 911.", "isFinal": true},
                {"speaker": "Caller", "start": 2.5, "end": 5.0, "text": "Help me!", "isFinal": true}
            ]
            """
            
            # Generate transcript via Gemini 2.5 Flash
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[gemini_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            
            # Cleanup the uploaded file from Google servers
            client.files.delete(name=gemini_file.name)
            
            # Parse response
            try:
                turns = json.loads(response.text)
            except Exception as e:
                print("Failed to parse Gemini response", e)
                turns = []
                
            return {"turns": turns}
            
        # Option 2: Use Deepgram (Fallback if Gemini not set but DG is)
        elif DEEPGRAM_API_KEY:
            async with httpx.AsyncClient(timeout=300) as client:
                with open(file_path, "rb") as f:
                    content = f.read()
                
                response = await client.post(
                    "https://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize=true",
                    headers={
                        "Authorization": f"Token {DEEPGRAM_API_KEY}",
                        "Content-Type": file.content_type or "audio/mpeg"
                    },
                    content=content
                )
                
                res_json = response.json()
                if "results" not in res_json:
                    return {"turns": [], "error": "Transcription failed", "raw": res_json}
                    
                alts = res_json["results"]["channels"][0]["alternatives"][0]
                words = alts.get("words", [])
                
                turns = []
                current_turn = None
                
                for w in words:
                    speaker_id = w.get("speaker", 0)
                    speaker = "Operator" if speaker_id == 0 else "Caller"
                    
                    if current_turn and current_turn['speaker'] == speaker:
                        current_turn['text'] += f" {w['punctuated_word']}"
                        current_turn['end'] = w['end']
                    else:
                        if current_turn:
                            turns.append(current_turn)
                        current_turn = {
                            "speaker": speaker,
                            "start": w['start'],
                            "end": w['end'],
                            "text": w['punctuated_word'],
                            "isFinal": True
                        }
                if current_turn:
                    turns.append(current_turn)
                    
                return {"turns": turns}
                
        else:
            return {"error": "Neither GEMINI_KEY nor DEEPGRAM_API_KEY are set."}
            
    except Exception as e:
        print(f"Transcription Error: {e}")
        return {"error": str(e), "turns": []}
    finally:
        # Cleanup local temp file
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
