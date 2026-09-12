const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button\s*key=\{c\.id\}\s*onClick=\{\(\) => setSelectedCaseId\(c\.id\)\}\s*className=\{`flex text-left w-full bg-\[var\(--bg-panel\)\] border border-\[var\(--border\)\] transition-colors hover:bg-\[var\(--border\)\] focus:outline-none \$\{([^}]*)\}\`\}\s*style=\{\{ borderLeft: \`6px solid \$\{PRIORITY_COLORS\[c\.priority\]\}\` \}\}\s*>/g;

content = content.replace(regex, (match, p1) => {
  return `<div
          key={c.id}
          onClick={() => setSelectedCaseId(c.id)}
          className={\`flex text-left w-full bg-[var(--bg-panel)] border border-[var(--border)] transition-colors hover:bg-[var(--border)] focus:outline-none cursor-pointer \${${p1}}\`}
          style={{ borderLeft: \`6px solid \${PRIORITY_COLORS[c.priority]}\` }}
        >`;
});

content = content.replace(/<\/button>\s*\}\)\}\s*<div className="flex justify-center mt-4 pb-8">/g, 
  `</div>
      ))}
      <div className="flex justify-center mt-4 pb-8">`);

fs.writeFileSync('src/App.tsx', content);
