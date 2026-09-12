const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `  const renderTextWithHighlights = (text: string, signals: any[]) => {
    if (!text) return null;
    if (!signals || !signals.length) return <span>{text}</span>;`;

const newCode = `  const renderTextWithHighlights = (text: any, signals: any[]) => {
    if (!text) return null;
    
    // Handle case where Gemini returns an object instead of a string
    let processedText = typeof text === 'object' ? (text.en || text.english || Object.values(text)[0] || JSON.stringify(text)) : String(text);
    
    if (!signals || !signals.length) return <span>{processedText}</span>;`;

content = content.replace(oldCode, newCode);

const oldRegexSplit = `    const parts = text.split(regex);`;
const newRegexSplit = `    const parts = processedText.split(regex);`;
content = content.replace(oldRegexSplit, newRegexSplit);


fs.writeFileSync('src/App.tsx', content);
