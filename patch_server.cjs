const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `"extractedLocation": string | null (exact address or description of the location mentioned in the call. IMPORTANT: MUST be translated to English if spoken in a foreign language. e.g. "247 Mineral Falls Avenue"),`;
const repl1 = `"extractedLocation": string | null (exact address or description of the location mentioned in the call. IMPORTANT: MUST be translated to English if spoken in a foreign language. e.g. "247 Mineral Falls Avenue"),
      "location_estimate": {
        "confidence": "unknown" | "insufficient" | "low" | "medium" | "high",
        "confidenceScore": number (0-100),
        "latitude": number | null (estimated latitude based on the extractedLocation),
        "longitude": number | null (estimated longitude based on the extractedLocation),
        "radiusMeters": number (estimated accuracy radius),
        "label": string (human readable label for the location),
        "source": string (e.g. "Derived from caller-provided location clues"),
        "isVerified": false,
        "evidence": string[] (array of caller quotes relating to the location)
      } (Provide this object ONLY if a location clue is detected, otherwise output null),`;

code = code.replace(target1, repl1);

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts');
