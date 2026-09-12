const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The messed up part starts from:
/*
            )};
              })}
            </div>
*/
const brokenRegex = /\)\};\s*\}\)\}\s*<\/div>/g;
content = content.replace(brokenRegex, ')};');

fs.writeFileSync('src/App.tsx', content);
