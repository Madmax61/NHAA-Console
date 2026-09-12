const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace("  ChevronDown\n  Info,\n} from 'lucide-react';", "  ChevronDown,\n  Info\n} from 'lucide-react';");
fs.writeFileSync('src/App.tsx', app);
console.log('Fixed Lucide import');
