import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause,
  Trash2,
  Plus,
Shield, 
  AlertTriangle, 
  Phone, 
  Clock, 
  FileText, 
  Activity, 
  Server, 
  Database, 
  Volume2, 
  MapPin, 
  MessageSquare,
  FileDigit,
  Fingerprint,
  Mic,
  MicOff,
  PlaySquare,
  Square,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';





const PRIORITY_COLORS: Record<string, string> = {
  'CRITICAL': 'var(--critical)',
  'HIGH': 'var(--high)',
  'PENDING': 'var(--pending)',
  'RESOLVED': 'var(--resolved)',
};


export type Case = {
  id: string;
  priority: string;
  type: string;
  location: string;
  phone: string;
  lang: string;
  time: string;
  status: 'IN PROGRESS' | 'RESOLVED';
  turns: any[];
  analysis: any;
  metaData: any;
  auditLog?: any[];
  fileHash?: string;
  duration?: string;
  audioUrl?: string;
};

// --- COMPONENTS ---

const AudioWaveform = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#2E4457', // using Tailwind cyan-400 / info-tag color kinda
      progressColor: '#4FB8B0',
      cursorColor: '#E4572E',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
    });
    
    wavesurfer.load(url).catch((e) => {
      if (e.name !== 'AbortError' && !e.message?.includes('aborted')) {
        console.error('WaveSurfer load error:', e);
      }
    });
    
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    
    wavesurferRef.current = wavesurfer;
    
    return () => {
      wavesurfer.destroy();
    };
  }, [url]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="flex items-center gap-3 w-full bg-[var(--bg-panel)] border border-[var(--border)] p-2">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--bg-main)] hover:bg-[var(--info-tag)] text-[var(--text-primary)] border border-[var(--border)] transition-colors rounded-full"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
      </button>
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ACTIVE' | 'AUDIT'>('QUEUE');
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;

  const createNewCase = () => {
    const newId = `NHAA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: Case = {
      id: newId,
      priority: 'PENDING',
      type: 'NEW CALL',
      location: '',
      phone: '',
      lang: 'Auto-detect',
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' }),
      status: 'IN PROGRESS',
      turns: [],
      analysis: {},
      metaData: null
    };
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateCaseId = (oldId: string, newId: string) => {
    if (!newId || newId === oldId) return;
    setCases(prev => prev.map(c => c.id === oldId ? { ...c, id: newId } : c));
    if (selectedCaseId === oldId) {
      setSelectedCaseId(newId);
    }
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedCaseId === id) {
      setSelectedCaseId(null);
      setActiveTab('QUEUE');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] font-sans text-sm selection:bg-[var(--border)] selection:text-[var(--text-primary)] overflow-hidden">
      {/* TOP NAVIGATION BAR */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--bg-panel)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3 w-1/3">
          <Shield className="w-5 h-5 text-[var(--info-tag)]" />
          <span className="font-bold tracking-wider text-[var(--text-primary)]">NHAA 14566</span>
        </div>
        
        <div className="flex justify-center w-1/3 space-x-1">
          {(['QUEUE', 'ACTIVE', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab !== 'QUEUE' && !selectedCaseId}
              className={`px-6 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                activeTab === tab 
                  ? 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-primary)]' 
                  : (tab !== 'QUEUE' && !selectedCaseId) ? 'bg-transparent border-transparent text-[var(--text-secondary)] opacity-50 cursor-not-allowed' : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'QUEUE' ? 'Case Queue' : tab === 'ACTIVE' ? 'Active Call' : 'Evidence / Audit'}
            </button>
          ))}
          
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--resolved)]"></span>
            <span>SECURE SESSION: OPR-442</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-hidden p-2 min-h-0">
        {activeTab === 'QUEUE' && <CaseQueueView cases={cases} selectedCaseId={selectedCaseId} setSelectedCaseId={setSelectedCaseId} createNewCase={createNewCase} deleteCase={deleteCase} setActiveTab={setActiveTab} />}
        {activeTab === 'ACTIVE' && <ActiveCallView currentCase={selectedCase} updateCase={updateCase} updateCaseId={updateCaseId} />}
        {activeTab === 'AUDIT' && <EvidenceAuditView currentCase={selectedCase} updateCase={updateCase} />}
      </main>

      {/* BOTTOM STATUS STRIP */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[var(--bg-panel)] border-t border-[var(--border)] shrink-0 text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>Sys: ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>DB: SYNCED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--resolved)]" />
            <span>LATENCY: 42ms</span>
          </div>
        </div>
        <div className="italic text-[var(--info-tag)]">
          "AI suggestions support — not replace — operator judgment."
        </div>
      </footer>
    </div>
  );
}

// --- TYPES & HELPERS ---
type TranscriptLine = {
  id: number | string;
  speaker: string;
  speakerId?: string | null;
  timestamp: string;
  text: string;
};

const formatTimestamp = (val: number | string): string => {
  if (val == null) return "00:00";
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  const totalSeconds = num > 10000 ? Math.floor(num / 1000) : Math.floor(num);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const normalizeTranscript = (data: any): TranscriptLine[] => {
  if (data.turns && Array.isArray(data.turns)) {
    return data.turns.map((t: any, i: number) => ({
      id: t.id || i,
      speaker: t.speaker || t.role || t.speaker_id || 'Unknown',
      speakerId: t.speaker_id || null,
      timestamp: t.timestamp || formatTimestamp(t.start || t.start_seconds || 0),
      text: t.text || ''
    }));
  } else if (data.transcript && Array.isArray(data.transcript)) {
    return data.transcript.map((t: any, i: number) => ({
      id: t.id || i,
      speaker: t.role || t.speaker_id || t.speaker || 'Unknown',
      speakerId: t.speaker_id || null,
      timestamp: t.timestamp || formatTimestamp(t.start || t.start_seconds || 0),
      text: t.text || ''
    }));
  } else if (data.utterances && Array.isArray(data.utterances)) {
    return data.utterances.map((u: any, i: number) => ({
      id: i,
      speaker: u.speaker || 'Unknown',
      speakerId: u.speaker || null,
      timestamp: formatTimestamp(u.start || 0),
      text: u.text || ''
    }));
  }
  return [];
};

// --- VIEWS ---

function CaseQueueView({ cases, selectedCaseId, setSelectedCaseId, createNewCase, deleteCase, setActiveTab }: { cases: Case[], selectedCaseId: string | null, setSelectedCaseId: (id: string) => void, createNewCase: () => void, deleteCase: (id: string) => void, setActiveTab: (t: 'QUEUE' | 'ACTIVE' | 'AUDIT') => void }) {
    if (cases.length === 0) {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <Shield className="w-16 h-16 mb-4 opacity-20" />
          <p>No active or past cases in queue.</p>
          <p className="text-xs mt-2 text-center">Click the circular + button below to start a session.</p>
          <button onClick={createNewCase} className="mt-6 w-12 h-12 rounded-full bg-[var(--info-tag)] text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg shadow-black/50">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      );
    }
  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto pr-1">
      {cases.map((c) => (
        <div
          key={c.id}
          onClick={() => { setSelectedCaseId(c.id); setActiveTab('ACTIVE'); }}
          className={`flex text-left w-full bg-[var(--bg-panel)] border border-[var(--border)] transition-colors hover:bg-[var(--border)] focus:outline-none cursor-pointer ${
            selectedCaseId === c.id ? 'ring-1 ring-[var(--info-tag)] bg-[var(--border)]' : ''
          }`}
          style={{ borderLeft: `6px solid ${PRIORITY_COLORS[c.priority]}` }}
        >
          <div className="flex flex-col flex-1 p-3 gap-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[var(--text-primary)]">{c.id}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-[var(--bg-main)] border border-[var(--border)]" style={{ color: PRIORITY_COLORS[c.priority] }}>
                  {c.priority}
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-[var(--text-primary)]">{c.type}</span>
              </div>
              <div className="font-mono text-xs text-[var(--text-secondary)]">
                {c.time}
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-1 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {c.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {c.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {c.lang}
              </div>
            </div>
          </div>
          <div className="flex items-center px-3" onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}>
            <button className="text-[var(--text-secondary)] hover:text-[var(--critical)] p-2 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-4 pb-8">
        <button onClick={createNewCase} className="w-12 h-12 rounded-full bg-[var(--info-tag)] text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg shadow-black/50 hover:scale-105 active:scale-95 duration-200">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function ActiveCallView({ currentCase, updateCase, updateCaseId }: { currentCase: any, updateCase: (id: string, updates: any) => void, updateCaseId: (oldId: string, newId: string) => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backendUrl, setBackendUrl] = useState(() => {
    return window.location.origin;
  });

  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl);
  }, [backendUrl]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [analysisUnavailable, setAnalysisUnavailable] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto');
  
  // Re-connect WebSocket if language changes while streaming
  useEffect(() => {
    // Only restart if currently running and we have an active ref
    if (isRunningRef.current) {
      stopListening();
      // wait a bit for ws to close before restarting
      setTimeout(() => startListening(), 500);
    }
  }, [sourceLanguage]);
  
  const LANGUAGES = [
    { code: 'auto', label: 'Auto-detect' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'ur', label: 'Urdu' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'as', label: 'Assamese' },
    { code: 'ne', label: 'Nepali' },
    { code: 'sd', label: 'Sindhi' }
  ];
  
  // Audio state
  const [turns, setTurns] = useState<TranscriptLine[]>([]);
  const [uploadState, setUploadState] = useState<'idle'|'uploading'|'processing'|'success'|'error'>('idle');
  const [metaData, setMetaData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<any>({
    riskScore: 0,
    signals: [],
    recommendedActions: [],
    suggestedQuestions: [],
    callerStatus: 'Unknown',
    locationStatus: 'Unknown',
    extractedLocation: null,
    translations: {}, correctedOriginals: {}
  });

  // Sync state from selected case when it changes
  useEffect(() => {
    if (currentCase) {
      setTurns(currentCase.turns || []);
      setAnalysis(currentCase.analysis && Object.keys(currentCase.analysis).length > 0 ? currentCase.analysis : {
        riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [],
        callerStatus: 'Unknown', locationStatus: 'Unknown', extractedLocation: null, translations: {}, correctedOriginals: {}
      });
      setMetaData(currentCase.metaData || null);
      setPhoneNumber(currentCase.phone || '');
    } else {
      setTurns([]);
      setAnalysis({
        riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [],
        callerStatus: 'Unknown', locationStatus: 'Unknown', extractedLocation: null, translations: {}, correctedOriginals: {}
      });
      setMetaData(null);
      setPhoneNumber('');
    }
  }, [currentCase?.id]);

  // Sync back to currentCase when local state changes
  useEffect(() => {
    if (currentCase) {
      // Basic debounce/throttle logic here if needed, but doing it directly is fine for this demo
      updateCase(currentCase.id, { 
        turns, 
        analysis, 
        metaData, 
        phone: phoneNumber,
        ...(analysis.caseTitle && { type: analysis.caseTitle.toUpperCase() })
      });
    }
  }, [turns, analysis, metaData, phoneNumber]);

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRunningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const base = backendUrl.trim() || window.location.origin;
        const res = await fetch(`${base}/health`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) {
          setIsConnected(true);
          setRawError(null);
        } else {
          setIsConnected(false);
          setRawError(`Health check failed: ${res.status} ${res.statusText}`);
        }
      } catch (err: any) {
        setIsConnected(false);
        setRawError(err.message || 'Health check failed to fetch');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleTranscriptScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 60;
    isUserScrolledUpRef.current = !isNearBottom;
  };

  // Only auto-scroll within container when live listening and user hasn't scrolled up
  useEffect(() => {
    if (isRunning && !isUserScrolledUpRef.current && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [turns, isRunning]);
  const toggleIngestion = () => {
    if (isRunning) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState('uploading');
    setRawError(null);
    setTurns([]);
    setMetaData(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', sourceLanguage);

      const base = backendUrl.trim() || window.location.origin;
      let cleanUrl = base.replace(/\/$/, '');
      if (cleanUrl.startsWith('ws://')) cleanUrl = cleanUrl.replace('ws://', 'http://');
      else if (cleanUrl.startsWith('wss://')) cleanUrl = cleanUrl.replace('wss://', 'https://');
      
      const uploadUrl = `${cleanUrl}/api/transcribe_file`;

      setUploadState('processing');

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      const localAudioUrl = URL.createObjectURL(file);
      updateCase(currentCase.id, { audioUrl: localAudioUrl });
      const normalizedTurns = normalizeTranscript(data);
      if (normalizedTurns.length > 0) {
        setTurns(normalizedTurns);
        setMetaData({
          sha256: data.sha256 || null,
          language: data.language || null,
          speakerCount: data.speaker_count_detected || null
        });
        setUploadState('success');
        analyzeTranscript(normalizedTurns);
        // Position transcript at the beginning of the call
        isUserScrolledUpRef.current = true;
        setTimeout(() => {
          if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = 0;
          }
          window.scrollTo(0, 0);
        }, 50);
      } else {
        throw new Error('No transcript data found in backend response');
      }
    } catch (err: any) {
      setRawError(`File Upload Error: ${err.message}`);
      setUploadState('error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          updateCase(currentCase.id, { audioUrl });
        };
        mediaRecorder.start();
      } catch (e) {
        console.warn("MediaRecorder setup failed:", e);
      }
      
      let wsUrl = '';
      try {
        const base = backendUrl.trim() || window.location.origin;
        const parsedUrl = new URL(base);
        parsedUrl.protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        parsedUrl.pathname = '/ws/transcribe';
        if (sourceLanguage !== 'auto') {
          parsedUrl.searchParams.set('language', sourceLanguage);
        }
        wsUrl = parsedUrl.toString();
      } catch (e) {
        // Fallback
        const base = backendUrl.trim() || window.location.origin;
        const cleanUrl = base.replace(/\/$/, '').replace(/^http/, 'ws');
        wsUrl = (cleanUrl.startsWith('ws') ? cleanUrl : 'wss://' + cleanUrl) + '/ws/transcribe';
        if (sourceLanguage !== 'auto') {
          wsUrl += `?language=${sourceLanguage}`;
        }
      }
      
      console.log("Connecting WebSocket to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
          setIsConnected(true);
          setRawError(null);
          
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          audioContextRef.current = audioContext;

          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              let s = Math.max(-1, Math.min(1, inputData[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(pcmData.buffer);
            }
          };
          
          setIsRunning(true);
          isRunningRef.current = true;
          setMicError(null);
      };
      
      ws.onmessage = (e) => {
          try {
              const data = JSON.parse(e.data);
              if (data.turns) {
                  handleIncomingTurns(data.turns);
              }
          } catch (err) {}
      };
      
      ws.onerror = (e) => {
          console.error("WebSocket error:", e);
          setRawError('WebSocket connection error. Check backend logs or ngrok warning.');
          stopListening();
      };
      
      ws.onclose = (e) => {
          console.log("WebSocket closed", e.code, e.reason);
          setIsConnected(false);
          // If the backend sent an error message (like unsupported language), it might show up in the reason string
          if (e.code !== 1000 && e.code !== 1005 && e.reason) {
              setRawError(`Streaming disconnected: ${e.reason}`);
          }
          stopListening();
      };
      
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  const stopListening = () => {
    isRunningRef.current = false;
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    processorRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRunning(false);
  };

  function handleIncomingTurns(incomingTurns: any[]) {
      setTurns(prevTurns => {
        if (!incomingTurns || incomingTurns.length === 0) return prevTurns;
        let updated = false;
        let finalAdded = false;
        const nextTurns = prevTurns.map(t => ({...t}));

        incomingTurns.forEach((inc: any) => {
          // If this is a live transcription stream, the backend might always send start=0.0
          // We should append to the last turn if it's not final, or create a new turn if it is final.
          if (inc.language === 'Live' || inc.start === 0.0) {
            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && !lastTurn.isFinal) {
              // Update the ongoing turn
              if (lastTurn.text !== inc.text) {
                lastTurn.text = inc.text;
                updated = true;
              }
              if (inc.isFinal) {
                lastTurn.isFinal = true;
                updated = true;
                finalAdded = true;
              }
            } else {
              // Create a new turn
              nextTurns.push({
                id: Date.now() + Math.random(),
                speaker: inc.speaker || 'Unknown',
                start: lastTurn ? lastTurn.end + 0.1 : 0.0,
                end: lastTurn ? lastTurn.end + 2.0 : 2.0,
                timestamp: formatTimestamp(lastTurn ? lastTurn.end + 0.1 : 0.0),
                text: inc.text,
                isFinal: inc.isFinal || false
              });
              updated = true;
              if (inc.isFinal) finalAdded = true;
            }
          } else {
            // Original logic for when proper start/end timestamps are provided
            const existingIdx = nextTurns.findIndex(pt => Math.abs(pt.start - inc.start) < 0.2);
            if (existingIdx >= 0) {
              const existing = nextTurns[existingIdx];
              if (inc.speaker) existing.speaker = inc.speaker;
              if (existing.text !== inc.text || existing.end !== inc.end) {
                existing.text = inc.text;
                existing.end = inc.end;
                updated = true;
              } 
              if (inc.isFinal && !existing.isFinal) {
                existing.isFinal = true;
                updated = true;
                finalAdded = true;
              }
            } else {
              const lastTurn = nextTurns[nextTurns.length - 1];
              // Removed the aggressive 2.0 second merging to prevent caller/operator bleeding on diarization errors.
              // If it's the exact same utterance (checked above), it updates. Otherwise, it creates a new bubble.
              if (false) {
              } else {
                nextTurns.push({
                  id: inc.id || (Date.now() + Math.random()),
                  speaker: inc.speaker || 'Unknown',
                  start: inc.start,
                  end: inc.end,
                  timestamp: formatTimestamp(inc.start),
                  text: inc.text,
                  isFinal: inc.isFinal || false
                });
                updated = true;
                if (inc.isFinal) finalAdded = true;
              }
            }
          }
        });

        nextTurns.sort((a, b) => a.start - b.start);

        if (updated) {
          if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
          const now = Date.now();
          const lastAnalysisTime = (analysisTimerRef as any).lastRun || 0;
          if (now - lastAnalysisTime > 15000) {
              (analysisTimerRef as any).lastRun = now;
              analyzeTranscript(nextTurns);
          } else {
              analysisTimerRef.current = setTimeout(() => {
                  (analysisTimerRef as any).lastRun = Date.now();
                  analyzeTranscript(nextTurns);
              }, 15000 - (now - lastAnalysisTime));
          }
          return nextTurns;
        }
        return prevTurns;
      });
  }

  const analyzeTranscript = async (currentTurns: any[]) => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceLanguage: sourceLanguage,
          turns: currentTurns.map(t => ({
              ...t,
              text: t.isFinal ? t.text : `${t.text} (PARTIAL - DO NOT TRANSLATE)`
          })) 
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }
      const data = await res.json();
      if (data) {
        setAnalysis(prev => ({ ...prev, ...data }));
        setAnalysisUnavailable(false);
      }
    } catch (err: any) {
      console.warn('Failed to run AI analysis:', err.message);
      setAnalysisUnavailable(true);
    }
  };
  const toggleSpeaker = (idx: number) => {
    setTurns(prev => {
      const next = [...prev];
      if (next[idx]) {
        const s = next[idx].speaker;
        next[idx].speaker = s === 'Operator' ? 'Caller' : (s === 'Caller' ? 'Operator' : (s === 'OPR' ? 'CALLER' : (s === 'CALLER' ? 'OPR' : (s === 'A' ? 'B' : 'A'))));
      }
      return next;
    });
  };

  const swapAllSpeakers = () => {
    setTurns(prev => prev.map(t => {
      let nextSpeaker = t.speaker;
      if (['OPR', 'Operator', 'A'].includes(nextSpeaker)) {
        nextSpeaker = nextSpeaker === 'A' ? 'B' : (nextSpeaker === 'OPR' ? 'CALLER' : 'Caller');
      } else if (['CALLER', 'Caller', 'B'].includes(nextSpeaker)) {
        nextSpeaker = nextSpeaker === 'B' ? 'A' : (nextSpeaker === 'CALLER' ? 'OPR' : 'Operator');
      }
      return { ...t, speaker: nextSpeaker };
    }));
  };


  const getSafelyStringified = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return val.bn || val.hi || val.en || Object.values(val)[0] || JSON.stringify(val);
    }
    return String(val);
  };
  const renderTextWithHighlights = (text: any, signals: any[]) => {
    if (!text) return null;
    
    // Handle case where Gemini returns an object instead of a string
    let processedText = typeof text === 'object' ? (text.en || text.english || Object.values(text)[0] || JSON.stringify(text)) : String(text);
    
    if (!signals || !signals.length) return <span>{processedText}</span>;
    const dangerWords = signals.flatMap(s => {
      const str = typeof s === 'string' ? s : (s && s.keyword ? s.keyword : JSON.stringify(s || ''));
      return str.toLowerCase().replace(/["']/g, '').split(' ');
    });
    const validWords = dangerWords.filter(w => w.length > 3);
    if (validWords.length === 0) return <span>{processedText}</span>;
    const regex = new RegExp(`(${validWords.join('|')})`, 'gi');
    const parts = processedText.split(regex);
    
    return parts.map((part, i) => {
      if (!part) return <span key={i}>{part}</span>;
      if (dangerWords.some(dw => dw.length > 3 && dw.toLowerCase() === part.toLowerCase())) {
        return <span key={i} className="text-[var(--critical)] bg-[var(--critical)]/10 px-1 font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };
  const riskScore = analysis.riskScore || 0;
  const riskSignals = analysis.signals || [];
  const recommendedActions = analysis.recommendedActions || [];
  const suggestedQuestions = analysis.suggestedQuestions || [];
  const riskPriority = riskScore >= 90 ? 'critical' : riskScore >= 50 ? 'high' : 'low';
      if (!currentCase) {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <p className="text-[var(--text-secondary)] text-lg mb-4">No active case selected.</p>
          <button className="px-6 py-2 bg-[var(--info-tag)] text-black font-bold uppercase tracking-wider hover:bg-white transition-colors" onClick={() => document.querySelector('header button:last-child')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
            Start New Call
          </button>
        </div>
      );
    }
  
  return (
    <div className="flex flex-col h-full gap-2 min-h-0 overflow-hidden">
      {/* ACTIVE CALL HEADER */}
      <div className="flex items-center justify-between p-2 bg-[var(--bg-panel)] border border-[var(--border)] shrink-0">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={currentCase.id}
            onChange={(e) => updateCaseId(currentCase.id, e.target.value)}
            className="font-mono text-base font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent focus:border-[var(--info-tag)] hover:border-[var(--border)] outline-none w-32"
          />
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--bg-main)] border border-[var(--border)]">
            {isConnected === false ? (
              <XCircle className="w-3 h-3 text-[var(--critical)]" />
            ) : isConnected === true ? (
              <CheckCircle className="w-3 h-3 text-[var(--resolved)]" />
            ) : (
              <Activity className="w-3 h-3 text-[var(--text-secondary)]" />
            )}
            <span className={`text-xs font-mono ${isConnected === false ? 'text-[var(--critical)]' : isConnected === true ? 'text-[var(--resolved)]' : 'text-[var(--text-secondary)]'}`}>
              {isConnected === false ? 'BACKEND DISCONNECTED' : isConnected === true ? 'BACKEND CONNECTED' : 'WAITING FOR CONNECTION'}
            </span>
          </div>
          {/* Backend URL Config */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              disabled={isRunning}
              className="bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-primary)] px-2 py-1 w-48 focus:outline-none focus:border-[var(--info-tag)] disabled:opacity-50"
              placeholder="Optional: External backend URL"
            />
          </div>

          {/* Ingestion Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--bg-main)] border border-[var(--border)]">
            <div className={`w-2.5 h-2.5 rounded-full ${isRunning && isConnected ? 'bg-[var(--critical)] animate-pulse' : 'bg-[var(--text-secondary)]'}`}></div>
            <span className={`text-xs font-mono ${isRunning && isConnected ? 'text-[var(--critical)]' : 'text-[var(--text-secondary)]'}`}>
              {isRunning ? 'POLLING AUDIO TURNS' : 'INGESTION STOPPED'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] uppercase">Stress Vulnerability Index</span>
          {analysisUnavailable && (
            <span className="text-[10px] text-[var(--critical)] font-bold animate-pulse">UNAVAILABLE</span>
          )}
          <span className={`text-xs font-bold px-2 py-1 ${riskScore >= 90 ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)] text-[var(--bg-main)] border-[var(--high)]' : 'bg-[var(--info-tag)] text-[var(--bg-main)] border-[var(--info-tag)]'}`}>
            {riskPriority.toUpperCase()} {riskScore}/100
          </span>
        </div>
      </div>
      {/* 3-COLUMN LAYOUT */}
      <div className="flex flex-1 gap-2 min-h-0 overflow-hidden">
        
        {/* LEFT COL: Caller Details */}
        <div className="w-1/4 flex flex-col gap-2 min-h-0 overflow-y-auto">
          <div className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] flex-1 p-3 gap-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border)] pb-2">Caller Profile</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Phone Number</div>
                <input 
                  type="text"
                  className="font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)] w-full outline-none focus:border-[var(--info-tag)] text-white"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Source Language</div>
                <select 
                  className="font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)] uppercase w-full cursor-pointer outline-none focus:border-white text-white appearance-none"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label} {lang.code !== 'auto' ? `(${lang.code})` : ''}</option>
                  ))}
                </select>
                {metaData?.language && sourceLanguage === 'auto' && (
                   <div className="mt-1 text-[10px] text-[var(--info-tag)] uppercase">
                     Detected: {metaData.language}
                   </div>
                )}
                {analysis?.detectedLanguage && sourceLanguage === 'auto' && !metaData && (
                   <div className="mt-1 text-[10px] text-[var(--info-tag)] uppercase">
                     Detected: {analysis.detectedLanguage}
                   </div>
                )}
              </div>
              {metaData?.speakerCount != null && (
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Detected Speakers</div>
                <div className="font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)]">
                  {metaData.speakerCount} Speakers
                </div>
              </div>
              )}
              {metaData?.sha256 != null && (
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Audio Evidence Hash</div>
                <div className="font-mono text-[10px] bg-[var(--bg-main)] p-2 border border-[var(--border)] truncate" title={metaData.sha256}>
                  {metaData.sha256.substring(0, 32)}...
                </div>
              </div>
              )}
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Caller Status</div>
                <div className={`font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)] ${riskScore > 50 ? 'text-[var(--critical)]' : 'text-[var(--info-tag)]'}`}>
                  {analysis.callerStatus || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Geolocation</div>
                <div className="flex flex-col gap-1 font-mono text-xs bg-[var(--bg-main)] p-2 border border-[var(--border)]">
                  <span>{analysis.extractedLocation || ''}</span>
                  <span className="text-[10px] text-[var(--info-tag)] uppercase">STATUS: {analysis.locationStatus || 'unknown'}</span>
                </div>
              </div>
            </div>
            {micError && (
              <div className="mt-4 p-3 border border-[var(--critical)] bg-[var(--critical)]/10 text-[var(--critical)] text-xs">
                <strong>Microphone Error</strong>
                <p className="mt-1 opacity-80 break-words">{micError}</p>
              </div>
            )}
            {rawError && (
              <div className="mt-4 p-3 border border-[var(--critical)] bg-[var(--critical)]/10 text-[var(--critical)] text-xs">
                <strong>Backend Error</strong>
                <p className="mt-1 opacity-80 break-words">{rawError}</p>
                {isConnected === false && <p className="mt-2 opacity-80">Make sure your backend server is running and accessible.</p>}
              </div>
            )}
          </div>
        </div>
        {/* CENTER COL: Transcript & Notes */}
        <div className="w-2/4 flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] flex-1 min-h-0 overflow-hidden">
            
            {/* Controls Header */}
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border)] p-2 bg-[var(--bg-panel)] shrink-0 flex justify-between items-center gap-2">
              <span className="truncate">Live Transcript & Translation</span>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <input 
                  type="file" 
                  accept="audio/mp3,audio/wav,audio/mpeg,audio/x-wav" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                {turns.length > 0 && (
                  <div className="flex items-center gap-1 mr-1">
                    <button 
                      onClick={() => {
                        if (transcriptContainerRef.current) {
                          transcriptContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          isUserScrolledUpRef.current = true;
                        }
                      }}
                      title="Scroll to top of transcript"
                      className="px-2 py-1 text-[10px] font-bold border transition-colors bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]"
                    >
                      TOP ⤒
                    </button>
                    <button 
                      onClick={() => {
                        if (transcriptContainerRef.current) {
                          transcriptContainerRef.current.scrollTo({ top: transcriptContainerRef.current.scrollHeight, behavior: 'smooth' });
                          isUserScrolledUpRef.current = false;
                        }
                      }}
                      title="Scroll to latest line"
                      className="px-2 py-1 text-[10px] font-bold border transition-colors bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]"
                    >
                      END ⤓
                    </button>
                  </div>
                )}
                <button 
                  onClick={swapAllSpeakers}
                  disabled={turns.length === 0}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold border transition-colors bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50"
                >
                  SWAP OPR/CALLER
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRunning || uploadState === 'uploading' || uploadState === 'processing'}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border transition-colors bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center">⇧</span>
                  {uploadState === 'uploading' ? 'UPLOADING...' : uploadState === 'processing' ? 'TRANSCRIBING...' : uploadState === 'error' ? 'FAILED' : uploadState === 'success' ? 'TRANSCRIPT READY' : 'UPLOAD AUDIO'}
                </button>
                <button 
                  onClick={toggleIngestion}
                  disabled={uploadState === 'uploading' || uploadState === 'processing'}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold border transition-colors ${
                    isRunning 
                      ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)] animate-pulse' 
                      : 'bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50'
                  }`}
                >
                  {isRunning ? <Square className="w-3 h-3" /> : <PlaySquare className="w-3 h-3" />}
                  {isRunning ? 'STOP LISTENING' : 'START LISTENING'}
                </button>
              </div>
            </h3>
            {/* Transcript Flow */}
            <div 
              ref={transcriptContainerRef}
              onScroll={handleTranscriptScroll}
              className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3 font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] m-2 border border-[var(--border)]"
            >
              {turns.map((turn, idx) => {
                const isFinal = turn.isFinal !== false;
                return (
                <div key={turn.id || idx} className={`flex gap-3`}>
                  <span className="text-[var(--info-tag)] w-12 shrink-0">{turn.timestamp || (turn.start?.toFixed(1) + 's')}</span>
                  <span 
                    className="text-[var(--text-primary)] font-bold w-16 shrink-0 truncate cursor-pointer hover:text-[var(--info-tag)] hover:underline transition-colors" 
                    title="Click to correct speaker"
                    onClick={() => toggleSpeaker(idx)}
                  >
                    {turn.speaker}:
                  </span>
                  <div className="flex flex-col gap-1">
                    {/* Display Translation if available, otherwise Original */}
                    {(isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (
                      <>
                        <span>{renderTextWithHighlights(
                          typeof analysis.translations[idx.toString()] === 'string' 
                            ? analysis.translations[idx.toString()] 
                            : JSON.stringify(analysis.translations[idx.toString()]), 
                          riskSignals
                        )}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                          {getSafelyStringified((analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text)}
                        </span>
                      </>
                    ) : (
                      <span className={!isFinal ? "opacity-70" : ""}>
                        {renderTextWithHighlights((analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text, riskSignals)}
                        {(isFinal && analysisUnavailable) && (
                          <span className="ml-2 text-[10px] text-[var(--critical)] opacity-70 italic border border-[var(--critical)] px-1">Translation Failed</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )})}
              
              {!isRunning && uploadState !== 'uploading' && uploadState !== 'processing' && turns.length === 0 && (
                <div className="flex flex-col justify-center items-center h-full text-[var(--text-secondary)] gap-6 p-8">
                  <div className="text-center italic opacity-60">
                    No transcript data available. Choose an input method to begin.
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={toggleIngestion}
                      className="flex flex-col items-center gap-2 p-6 border-2 border-[var(--border)] hover:border-[var(--info-tag)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-panel)] w-48"
                    >
                      <Mic className="w-8 h-8" />
                      <span className="font-bold text-sm">LIVE AUDIO</span>
                      <span className="text-[10px] opacity-70">Stream via Microphone</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-6 border-2 border-[var(--border)] hover:border-[var(--info-tag)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-panel)] w-48"
                    >
                      <span className="text-3xl font-bold">⇧</span>
                      <span className="font-bold text-sm">UPLOAD FILE</span>
                      <span className="text-[10px] opacity-70">MP3 / WAV Audio File</span>
                    </button>
                  </div>
                </div>
              )}
              {isRunning && turns.length === 0 && (
                <div className="flex justify-center items-center h-full text-[var(--text-secondary)] opacity-50 italic animate-pulse">
                  <div className="flex flex-col items-center gap-2"><Mic className="w-8 h-8 text-[var(--critical)] animate-bounce" />Listening for live audio...</div>
                </div>
              )}
              {(uploadState === 'uploading' || uploadState === 'processing') && turns.length === 0 && (
                <div className="flex justify-center items-center h-full text-[var(--text-secondary)] opacity-70 italic animate-pulse">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold">...</span>
                    <span>{uploadState === 'uploading' ? 'Uploading audio...' : 'Transcribing and diarizing...'}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Operator Notes */}
            <div className="p-2 pt-0 shrink-0">
              <textarea 
                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"
                placeholder="Enter operator notes here... (Time-stamped on submit)"
              ></textarea>
            </div>
          </div>
        </div>
        {/* RIGHT COL: AI Insights / Actions */}
        <div className="w-1/4 flex flex-col gap-2 min-h-0 overflow-y-auto">
          {/* Risk Score Panel */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>Stress Vulnerability Index</span>
               <AlertTriangle className={`w-4 h-4 ${riskScore >= 90 ? 'text-[var(--critical)]' : riskScore >= 50 ? 'text-[var(--high)]' : 'text-[var(--info-tag)]'}`} />
             </div>
             <div className="p-3 bg-[var(--bg-main)] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>SVI</span>
                  <span className={`${riskScore >= 90 ? 'text-[var(--critical)]' : riskScore >= 50 ? 'text-[var(--high)]' : 'text-[var(--info-tag)]'} font-bold`}>{riskScore} / 100</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-panel)] border border-[var(--border)]">
                  <div className={`h-full ${riskScore >= 90 ? 'bg-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)]' : 'bg-[var(--info-tag)]'}`} style={{ width: `${riskScore}%` }}></div>
                </div>
             </div>
          </div>
          {/* Risk Signals */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col min-h-[100px]">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>Detected Risk Signals</span>
               <Activity className="w-4 h-4 text-[var(--info-tag)]" />
             </div>
             <div className="p-2 bg-[var(--bg-main)] text-xs font-mono space-y-1 flex-1">
                {riskSignals.length > 0 ? (
                  riskSignals.map((sig: any, i: number) => (
                    <div key={i} className="flex gap-2 p-1 border-b border-[var(--border)] text-[var(--text-primary)]">
                      <span className="text-[var(--critical)] shrink-0">⚠</span>
                      <span>{typeof sig === 'string' ? sig : `${sig.keyword || sig.category}: ${sig.description || ''}`}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--text-secondary)] italic p-1">No major risk signals detected.</div>
                )}
             </div>
          </div>
          {/* Suggested Follow-ups */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col min-h-[100px]">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>Suggested Questions</span>
               <MessageSquare className="w-4 h-4 text-[var(--info-tag)]" />
             </div>
             <div className="p-2 bg-[var(--bg-main)] text-xs space-y-2 text-[var(--text-secondary)] flex-1">
                {suggestedQuestions.length > 0 ? (
                  suggestedQuestions.map((q: string, i: number) => (
                    <div key={i} className="p-2 border border-[var(--border)] bg-[var(--bg-panel)] hover:text-[var(--text-primary)] cursor-pointer">
                      "{q}"
                    </div>
                  ))
                ) : (
                  <div className="italic p-1">Listening for context...</div>
                )}
             </div>
          </div>
          {/* Actions */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col mt-auto shrink-0">
             <details className="group" open>
               <summary className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                 <span>Recommended Actions</span>
                 <ChevronDown className="w-4 h-4 text-[var(--info-tag)] group-open:rotate-180 transition-transform" />
               </summary>
               <div className="p-2 bg-[var(--bg-main)] grid grid-cols-1 gap-2">
                 {recommendedActions.length > 0 ? (
                   recommendedActions.map((action: string, i: number) => (
                     <button key={i} className={`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 ${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}`}>
                       {action}
                     </button>
                   ))
                 ) : (
                   <button className="w-full p-2 bg-[var(--bg-panel)] text-[var(--text-secondary)] font-bold text-xs uppercase border border-[var(--border)] opacity-50 cursor-not-allowed">
                     Awaiting Analysis
                   </button>
                 )}
               </div>
             </details>
          </div>
        </div>
      </div>
    </div>
  );
}
function EvidenceAuditView({ currentCase, updateCase }: { currentCase: any, updateCase: (id: string, updates: any) => void }) {
    if (!currentCase) {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <Fingerprint className="w-16 h-16 mb-4 opacity-20" />
          <p>No case selected for audit.</p>
        </div>
      );
    }

    const hasData = (currentCase.turns && currentCase.turns.length > 0) || (currentCase.analysis && Object.keys(currentCase.analysis).length > 0 && currentCase.analysis.riskScore > 0);
    
    if (!hasData && currentCase.status !== 'RESOLVED') {
      return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--text-secondary)]">
          <Activity className="w-12 h-12 mb-4 opacity-30 animate-pulse" />
          <p className="text-lg">Waiting for Call Analytics...</p>
          <p className="text-xs mt-2 opacity-60">Begin the active call recording to populate audit data.</p>
        </div>
      );
    }

  return (
    <div className="flex flex-col h-full gap-2 p-2 bg-[var(--bg-panel)] border border-[var(--border)] max-w-5xl mx-auto">
      
      <div className="flex justify-between items-end border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">{currentCase.id} - AUDIT RECORD</h2>
          <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-4">
            <span>Status: <span className={`font-bold ${currentCase.status === 'RESOLVED' ? 'text-[var(--resolved)]' : 'text-[var(--critical)]'}`}>{currentCase.status}</span></span>
            {currentCase.status !== 'RESOLVED' && (
              <button 
                onClick={() => updateCase(currentCase.id, { status: 'RESOLVED', priority: 'RESOLVED' })}
                className="px-3 py-1 bg-[var(--resolved)] text-black font-bold uppercase text-[10px] hover:bg-white transition-colors"
              >
                Close Case
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
             if (!currentCase.turns) return;
             const text = currentCase.turns.map((t: any) => `[${t.speaker || 'Unknown'}] ${t.text}`).join('');
             const blob = new Blob([text], { type: 'text/plain' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `${currentCase.id}-transcript.txt`;
             a.click();
          }} className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-xs font-mono hover:bg-[var(--border)] hover:text-white transition-colors cursor-pointer">
             <FileText className="w-4 h-4" />
             EXPORT TRANSCRIPT
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-xs font-mono">
             <Fingerprint className="w-4 h-4 text-[var(--info-tag)]" />
             CHAIN OF CUSTODY VERIFIED
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 h-full min-h-0 overflow-hidden">
        {/* Audio / Technical Meta */}
        <div className="w-1/2 flex flex-col gap-4">
          
          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Original Audio Recording
            </h3>
            
            {/* Audio Player or Waveform */}
            {currentCase.audioUrl ? (
              <AudioWaveform url={currentCase.audioUrl} />
            ) : (
              <div className="h-16 w-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center overflow-hidden px-1 space-x-[2px]">
                {Array.from({ length: 60 }).map((_, i) => {
                   const h = (Math.sin(i * 0.5 + currentCase.id.charCodeAt(0)) * 40) + 50 + (Math.random() * 10);
                   return <div key={i} className="w-1 bg-[var(--info-tag)]" style={{ height: `${h}%`, opacity: currentCase.status === 'RESOLVED' ? 0.3 : (i < 30 ? 1 : 0.3) }}></div>;
                })}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2">
              <div>
                <div className="text-[var(--text-secondary)]">Duration</div>
                <div>{currentCase.turns && currentCase.turns.length > 0 ? `00:${Math.floor(currentCase.turns.length * 2.5).toString().padStart(2, '0')}` : '00:00'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Format</div>
                <div>PCM / 16kHz / Mono</div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-3">
             <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <FileDigit className="w-4 h-4" /> Cryptographic Signatures
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Audio File SHA-256</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] break-all select-all">
                  {currentCase.fileHash || 'Pending Capture...'}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Transcript Version</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)]">
                  {currentCase.status === 'RESOLVED' ? 'v1.0.0-final (Locked)' : 'Live Streaming (Mutable)'}
                </div>
              </div>
              
            </div>
          </div>

        </div>

        {/* Audit Log */}
        <div className="w-1/2 flex flex-col border border-[var(--border)] bg-[var(--bg-main)]">
           <div className="bg-[#25394B] p-3 border-b border-[var(--border)] font-bold text-xs uppercase flex items-center gap-2">
             <FileText className="w-4 h-4 text-[var(--info-tag)]" />
             System Audit Log
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              
              {currentCase.auditLog && currentCase.auditLog.map((log: any, idx: number) => {
                let colorClass = 'text-[var(--info-tag)]';
                if (log.type === 'operator') colorClass = 'text-[var(--text-secondary)]';
                if (log.type === 'ai') colorClass = 'text-[var(--high)]';
                if (log.type === 'alert') colorClass = 'text-[var(--critical)]';

                return (
                  <div key={idx} className="flex gap-4">
                    <span className="text-[var(--text-secondary)] w-24 shrink-0">{log.time}</span>
                    <span className={`${colorClass} w-24 shrink-0`}>[{log.actor}]</span>
                    <span className="text-[var(--text-primary)]">{log.message}</span>
                  </div>
                );
              })}

              {currentCase.analysis && currentCase.analysis.riskScore > 0 && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--high)] w-24 shrink-0">[AI_ENGINE]</span>
                  <span className="text-[var(--text-primary)]">Real-time risk assessment active. Score: {currentCase.analysis.riskScore}</span>
                </div>
              )}

              {currentCase.analysis && currentCase.analysis.riskScore > 80 && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--critical)] w-24 shrink-0">[ALERT]</span>
                  <span className="text-[var(--text-primary)]">Critical Risk Detected.</span>
                </div>
              )}

              {currentCase.status === 'RESOLVED' && (
                <div className="flex gap-4">
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">Now</span>
                  <span className="text-[var(--text-secondary)] w-24 shrink-0">[OPERATOR]</span>
                  <span className="text-[var(--text-primary)]">Case officially closed and locked.</span>
                </div>
              )}

           </div>
        </div>

      </div>    </div>
  );
}
