const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

if (!code.includes('const [mapError, setMapError] = useState(false);')) {
  code = code.replace(
    'const [estimate, setEstimate] = useState<LocationEstimate>({ confidence: "unknown", confidenceScore: 0 });',
    'const [estimate, setEstimate] = useState<LocationEstimate>({ confidence: "unknown", confidenceScore: 0 });\n  const [mapError, setMapError] = useState(false);'
  );
}

// Fix typescript errors
// 1. Vite import.meta.env typing fix or just ts-ignore
code = code.replace('import.meta.env.VITE_MAPTILER_KEY', '(import.meta as any).env.VITE_MAPTILER_KEY');
code = code.replace('import.meta.env.VITE_MAPTILER_KEY', '(import.meta as any).env.VITE_MAPTILER_KEY');

// 2. DataDrivenPropertyValueSpecification fix
code = code.replace(`'circle-radius': interactive ? { stops: [[10, 2], [16, radius / 5]] } : 30, // rough approximation visually`, `'circle-radius': interactive ? ({ stops: [[10, 2], [16, radius / 5]] } as any) : 30, // rough approximation visually`);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('import maplibregl from "maplibre-gl";\nimport "maplibre-gl/dist/maplibre-gl.css";\n', '');
fs.writeFileSync('src/App.tsx', app);

console.log('Fixed linting');
