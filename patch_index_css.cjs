const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const link = '<link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />\n  </head>';
code = code.replace('</head>', link);

fs.writeFileSync('index.html', code);
console.log('Patched index.html');
