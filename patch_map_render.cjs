const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

// Update import
code = code.replace("import * as maplibregl from 'maplibre-gl';", "import { Map as MaplibreMap } from 'maplibre-gl';");

// Update Map instantiation
code = code.replace("new maplibregl.Map({", "new MaplibreMap({");

// Add map.resize() logic
const resizeLogic = `
      map.on('error', (e) => {
         console.error('MapLibre error:', e);
         // Don't set error just for missing glyphs or minor things
         if (e.error && e.error.status === 401) setMapError(true);
      });

      // Force resize to fix black screen issue
      setTimeout(() => map.resize(), 50);
      setTimeout(() => map.resize(), 300);
      setTimeout(() => map.resize(), 800);
      
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);
      
      map.on('remove', () => {
        resizeObserver.disconnect();
      });
`;

code = code.replace(/map\.on\('error', \(\) => setMapError\(true\)\);/, resizeLogic);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched map render');
