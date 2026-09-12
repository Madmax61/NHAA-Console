const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const oldTiles = `        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'`;

const newTiles = `        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'`;

code = code.replace(oldTiles, newTiles);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched to Esri Dark Canvas');
