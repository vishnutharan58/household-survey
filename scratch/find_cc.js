const fs = require('fs');
const lines = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("activeTab === 'cc'"));
console.log(lines.slice(start, start + 300).join('\n'));
