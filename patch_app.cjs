const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/translations: \{\}/g, "translations: {}, correctedOriginals: {}");

// Also update where the original text is rendered
const oldRender = `{(isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (
                      <>
                        <span>{renderTextWithHighlights(analysis.translations[idx.toString()], riskSignals)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                          {turn.text}
                        </span>
                      </>
                    ) : (
                      <span className={!isFinal ? "opacity-70" : ""}>
                        {renderTextWithHighlights(turn.text, riskSignals)}
                        {(isFinal && analysisUnavailable) && (
                          <span className="ml-2 text-[10px] text-[var(--critical)] opacity-70 italic border border-[var(--critical)] px-1">Translation Failed</span>
                        )}
                      </span>
                    )}`;

const newRender = `{(isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (
                      <>
                        <span>{renderTextWithHighlights(analysis.translations[idx.toString()], riskSignals)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                          {(analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text}
                        </span>
                      </>
                    ) : (
                      <span className={!isFinal ? "opacity-70" : ""}>
                        {renderTextWithHighlights((analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text, riskSignals)}
                        {(isFinal && analysisUnavailable) && (
                          <span className="ml-2 text-[10px] text-[var(--critical)] opacity-70 italic border border-[var(--critical)] px-1">Translation Failed</span>
                        )}
                      </span>
                    )}`;

if (content.includes("{(isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (")) {
    content = content.replace(oldRender, newRender);
    fs.writeFileSync('src/App.tsx', content);
    console.log("App.tsx patched successfully.");
} else {
    console.log("Could not find the render block to replace.");
}

