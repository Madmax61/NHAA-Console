const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const toastHtml = `
      {toastMessage && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[var(--info-tag)] text-black px-6 py-3 rounded shadow-lg font-bold text-sm uppercase tracking-wider animate-bounce z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function EvidenceAuditView`;

app = app.replace("    </div>\n  );\n}\n\nfunction EvidenceAuditView", toastHtml);
fs.writeFileSync('src/App.tsx', app);
