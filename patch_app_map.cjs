const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('import { LocationConfidenceMap }')) {
  app = app.replace(
     "import { Play, Pause",
     "import { LocationConfidenceMap } from './LocationConfidenceMap';\nimport { Play, Pause"
  );
}

const geoLocStr = `<div className="flex flex-col gap-1 font-mono text-xs bg-[var(--bg-main)] p-2 border border-[var(--border)]">
                  <span>{analysis.extractedLocation || ''}</span>
                  <span className="text-[10px] text-[var(--info-tag)] uppercase">STATUS: {analysis.locationStatus || 'unknown'}</span>
                </div>
              </div>`;

const newGeoLocStr = `<div className="flex flex-col gap-1 font-mono text-xs bg-[var(--bg-main)] p-2 border border-[var(--border)]">
                  <span>{analysis.extractedLocation || ''}</span>
                  <span className="text-[10px] text-[var(--info-tag)] uppercase">STATUS: {analysis.locationStatus || 'unknown'}</span>
                </div>
              </div>
              
              <LocationConfidenceMap analysis={analysis} />
`;

app = app.replace(geoLocStr, newGeoLocStr);

fs.writeFileSync('src/App.tsx', app);
