const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const analyzeOld = `      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();`;

const analyzeNew = `      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }
      const data = await res.json();`;

content = content.replace(analyzeOld, analyzeNew);

const uiOld = `                    ) : (
                      <span className={!turn.isFinal ? "opacity-70" : ""}>{renderTextWithHighlights(turn.text, riskSignals)}</span>
                    )}`;

const uiNew = `                    ) : (
                      <span className={!turn.isFinal ? "opacity-70" : ""}>
                        {renderTextWithHighlights(turn.text, riskSignals)}
                        {(turn.isFinal && analysisUnavailable) && (
                          <span className="ml-2 text-[10px] text-[var(--critical)] opacity-70 italic border border-[var(--critical)] px-1">Translation Failed</span>
                        )}
                      </span>
                    )}`;

content = content.replace(uiOld, uiNew);

fs.writeFileSync('src/App.tsx', content);
