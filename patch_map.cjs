const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

// Update props to include onVerify
code = code.replace(
  'export function LocationConfidenceMap({ analysis }: { analysis: any }) {',
  'export function LocationConfidenceMap({ analysis, onVerify }: { analysis: any; onVerify?: (est: any) => void }) {'
);

// Update verifyLocation to not set demoState
const oldVerify = `  const verifyLocation = () => {
    if (window.confirm("Confirm that the caller-stated location has been verified?")) {
      setDemoState("verified");
      setEstimate(prev => ({ ...prev, confidence: "verified", isVerified: true, confidenceScore: 98, radiusMeters: Math.min(prev.radiusMeters || 75, 75) }));
    }
  };`;

const newVerify = `  const verifyLocation = () => {
    if (window.confirm("Confirm that the caller-stated location has been verified?")) {
      setEstimate(prev => {
        const updated = { ...prev, confidence: "verified" as any, isVerified: true, confidenceScore: 98, radiusMeters: Math.min(prev.radiusMeters || 75, 75) };
        if (onVerify) {
          onVerify(updated);
        }
        return updated;
      });
    }
  };`;

code = code.replace(oldVerify, newVerify);
fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched LocationConfidenceMap.tsx');
