const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const keyCheckLogic = `    // @ts-ignore
    if (import.meta.env.VITE_MAPTILER_KEY) {
       // @ts-ignore
       styleUrl = \`https://api.maptiler.com/maps/streets-v2/style.json?key=\${import.meta.env.VITE_MAPTILER_KEY}\`;
    }`;

code = code.replace(keyCheckLogic, '');

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched to OSM only');
