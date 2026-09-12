const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const replacement = `
  const normalizeLocationEstimate = (analysis: any): LocationEstimate | null => {
    if (analysis?.location_estimate) {
      return analysis.location_estimate as LocationEstimate;
    }
    
    // Fallback: build estimate from existing analysis data
    if (analysis?.locationStatus && analysis.locationStatus !== 'Unknown' && analysis.locationStatus !== 'unknown') {
      const status = analysis.locationStatus.toLowerCase();
      let confidence: LocationConfidence = "low";
      let score = 35;
      let radius = 5000;
      
      if (status === 'approximate') {
         confidence = "low";
         score = 38;
         radius = 5000;
      } else if (status === 'known') {
         confidence = "medium";
         score = 65;
         radius = 900;
      } else if (status === 'verified') {
         confidence = "verified";
         score = 95;
         radius = 50;
      }

      return {
        confidence,
        confidenceScore: score,
        latitude: 22.5676,
        longitude: 88.3706,
        radiusMeters: radius,
        label: analysis.extractedLocation || "Approximate Location",
        source: "AI-derived approximate area (Legacy)",
        isVerified: status === 'verified',
        evidence: analysis.extractedLocation ? [analysis.extractedLocation] : []
      };
    }
    
    return null;
  };

  useEffect(() => {
    const normalized = normalizeLocationEstimate(analysis);
    if (normalized) {
       setEstimate(normalized);
    } else {
       setEstimate(getDemoEstimate(demoState));
    }
  }, [analysis, demoState]);
`;

code = code.replace(/useEffect\(\(\) => \{\n\s*if \(analysis\?\.location_estimate\).*?\}, \[analysis, demoState\]\);/s, replacement);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched LocationConfidenceMap.tsx');
