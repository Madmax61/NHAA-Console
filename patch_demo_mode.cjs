const fs = require('fs');
let code = fs.readFileSync('src/LocationConfidenceMap.tsx', 'utf8');

const replacement = `
  const [demoState, setDemoState] = useState<LocationConfidence | "auto">("auto");

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

const optionAuto = `<option value="auto">Auto (Backend)</option>\n                             <option value="unknown">Unknown</option>`;
code = code.replace(`<option value="unknown">Unknown</option>`, optionAuto);

fs.writeFileSync('src/LocationConfidenceMap.tsx', code);
console.log('Patched demo mode');
