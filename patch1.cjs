const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('Info,')) {
    app = app.replace("} from 'lucide-react';", "  Info,\n} from 'lucide-react';");
}
fs.writeFileSync('src/App.tsx', app);
