const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const maplibreImports = `
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type LocationConfidence = "unknown" | "insufficient" | "low" | "medium" | "high" | "verified";

type LocationEstimate = {
  confidence: LocationConfidence;
  confidenceScore: number;
  label?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  source?: string;
  isVerified?: boolean;
  evidence?: string[];
};
`;

if (!app.includes('maplibre-gl')) {
  app = app.replace("import WaveSurfer from 'wavesurfer.js';", "import WaveSurfer from 'wavesurfer.js';" + maplibreImports);
}
fs.writeFileSync('src/App.tsx', app);
