const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

code = code.replace(
  '<div ref={mapModalContainer} className="absolute inset-0" />',
  '<div ref={mapModalContainer} className="absolute inset-0" style={{ minHeight: "100%", minWidth: "100%" }} />'
);

code = code.replace(
  '<div ref={mapContainer} className="absolute inset-0 pointer-events-none" />',
  '<div ref={mapContainer} className="absolute inset-0 pointer-events-none" style={{ minHeight: "100%", minWidth: "100%" }} />'
);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched min size');
