const fs = require('fs');
const file = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add exporting prop if missing
code = code.replace(/function OverviewTab\(\{([^}]+)\}\)/, (match, props) => {
  if (!props.includes('exporting')) {
    return `function OverviewTab({${props}, exporting}: any)`;
  }
  return match;
});

// 2. Replace the admin-export button
const oldButtonRegex = /<button id="admin-export"[^>]*>[\s\S]*?<\/button>/;
const newButton = `<button id="admin-export" onClick={() => setExportDropdownOpen(!exportDropdownOpen)} className="btn-accent" disabled={exporting}>
            <Download size={17} /> {exporting ? 'Exporting...' : 'Export Data'} <ChevronDown size={14} style={{ marginLeft: '4px' }} />
          </button>`;

if (code.match(oldButtonRegex)) {
  code = code.replace(oldButtonRegex, newButton);
  fs.writeFileSync(file, code);
  console.log('Successfully updated AdminDashboard.tsx!');
} else {
  console.log('Could not find the admin-export button!');
}
