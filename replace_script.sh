#!/bin/bash
awk '
    BEGIN { skip = 0 }
    
    /const \[isRunning, setIsRunning\] = useState\(false\);/ {
        print $0
        print "  const [backendUrl, setBackendUrl] = useState(\"http://127.0.0.1:8000\");"
        next
    }
    
    /const response = await fetch\('\''http:\/\/127.0.0.1:8000\/transcribe'\'', {/ {
        print "      const response = await fetch(`${backendUrl}/transcribe`, {"
        next
    }
    
    /<p className="mt-1 opacity-80">Make sure your FastAPI server is running on http:\/\/127.0.0.1:8000.<\/p>/ {
        print "                <p className=\"mt-1 opacity-80\">Make sure your FastAPI server is running on {backendUrl}.</p>"
        next
    }
    
    /Press Start Listening to ingest from http:\/\/127.0.0.1:8000\/transcribe/ {
        print "                  Press Start Listening to ingest from {backendUrl}/transcribe"
        next
    }
    
    /{isConnected === false \? '\''BACKEND DISCONNECTED'\'' : isConnected === true \? '\''BACKEND CONNECTED'\'' : '\''WAITING FOR CONNECTION'\''}/ {
        print $0
        next
    }

    /{\/\* Ingestion Status \*\/}/ {
        print "          {/* Backend URL Config */}"
        print "          <div className=\"flex items-center gap-2\">"
        print "            <input"
        print "              type=\"text\""
        print "              value={backendUrl}"
        print "              onChange={(e) => setBackendUrl(e.target.value)}"
        print "              disabled={isRunning}"
        print "              className=\"bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-primary)] px-2 py-1 w-48 focus:outline-none focus:border-[var(--info-tag)] disabled:opacity-50\""
        print "              placeholder=\"Backend URL\""
        print "            />"
        print "          </div>"
        print ""
        print $0
        next
    }

    { print $0 }
' src/App.tsx > tmp_App.tsx && mv tmp_App.tsx src/App.tsx
