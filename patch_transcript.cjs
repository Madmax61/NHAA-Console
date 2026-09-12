const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    {/* Display Translation if available, otherwise Original */}
                    {(isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (`;

const replacement = `                    {/* Display Translation if available, otherwise Original */}
                    {turn.isNote ? (
                       <span className="italic opacity-80 text-[var(--info-tag)] font-sans">{turn.text}</span>
                    ) : (isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
console.log('Patched Transcript View');
