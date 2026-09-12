const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace('https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css', 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css');
fs.writeFileSync('index.html', code);
