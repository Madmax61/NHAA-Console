const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const rasterStyle = `const fallbackStyle = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};`;

code = code.replace('let styleUrl = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";', rasterStyle + '\n    let styleUrl: any = fallbackStyle;');

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched map style');
