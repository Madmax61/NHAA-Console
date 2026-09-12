const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
`            updated = true;
            if (inc.isFinal) finalAdded = true;
          }
        });`,
`            updated = true;
            if (inc.isFinal) finalAdded = true;
            }
          }
        });`);
fs.writeFileSync('src/App.tsx', content);
