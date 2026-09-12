const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const getStrFn = `
  const getSafelyStringified = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return val.bn || val.hi || val.en || Object.values(val)[0] || JSON.stringify(val);
    }
    return String(val);
  };
`;

if (!content.includes('getSafelyStringified')) {
  const target = `  const renderTextWithHighlights`;
  content = content.replace(target, getStrFn + '\\n' + target);
}

content = content.replace(
  `{(analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text}`,
  `{getSafelyStringified((analysis.correctedOriginals && analysis.correctedOriginals[idx.toString()]) ? analysis.correctedOriginals[idx.toString()] : turn.text)}`
);

fs.writeFileSync('src/App.tsx', content);
