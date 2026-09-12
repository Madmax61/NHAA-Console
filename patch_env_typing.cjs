const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

code = code.replace(
  'if ((import.meta as any).env.VITE_MAPTILER_KEY) {',
  '// @ts-ignore\n    if (import.meta.env.VITE_MAPTILER_KEY) {'
);

code = code.replace(
  'styleUrl = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${(import.meta as any).env.VITE_MAPTILER_KEY}`;',
  '// @ts-ignore\n       styleUrl = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;'
);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched typing');
