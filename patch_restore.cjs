const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const replacement = `
  const [demoState, setDemoState] = useState<LocationConfidence | "auto">("auto");

  const getDemoEstimate = (state: LocationConfidence): LocationEstimate => {
    switch(state) {
      case "unknown": return { confidence: "unknown", confidenceScore: 0 };
      case "insufficient": return { confidence: "insufficient", confidenceScore: 10, source: "Vague clues", label: "I am outside" };
      case "low": return { confidence: "low", confidenceScore: 38, latitude: 22.5676, longitude: 88.3706, label: "Near Sealdah Station, Kolkata", radiusMeters: 5000, source: "Caller-stated landmark; AI-derived approximate area", isVerified: false, evidence: ["I am near Sealdah Station."] };
      case "medium": return { confidence: "medium", confidenceScore: 66, latitude: 22.5682, longitude: 88.3731, label: "Near Sealdah Station / Beliaghata Road, Kolkata", radiusMeters: 900, source: "Two caller-provided locality clues", isVerified: false, evidence: ["Sealdah Station", "Beliaghata Road"] };
      case "high": return { confidence: "high", confidenceScore: 88, latitude: 22.5680, longitude: 88.3735, label: "12 Beliaghata Road, near Sealdah, Kolkata", radiusMeters: 100, source: "Detailed caller-stated address", isVerified: false };
      case "verified": return { confidence: "verified", confidenceScore: 98, latitude: 22.5680, longitude: 88.3735, label: "12 Beliaghata Road, near Sealdah, Kolkata", radiusMeters: 75, source: "Operator-verified caller-stated location", isVerified: true };
      default: return { confidence: "unknown", confidenceScore: 0 };
    }
  };

  const [estimate, setEstimate] = useState<LocationEstimate>({ confidence: "unknown", confidenceScore: 0 });

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
    if (demoState !== "auto") {
      setEstimate(getDemoEstimate(demoState as LocationConfidence));
    } else {
      const normalized = normalizeLocationEstimate(analysis);
      if (normalized) {
         setEstimate(normalized);
      } else {
         setEstimate(getDemoEstimate("unknown"));
      }
    }
  }, [analysis, demoState]);
`;

code = code.replace(/const \[demoState, setDemoState\].*?\}, \[analysis, demoState\]\);/s, replacement);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Restored deleted functions');
