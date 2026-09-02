const fs = require('fs');
const txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const idx = txt.indexOf("activeTab === 'events'");
const endIdx = txt.indexOf("activeTab === 'users'");
const content = txt.substring(idx, endIdx);
const lines = content.split('\n');
lines.forEach((l, i) => { if (l.includes('Delete')) console.log(i + ': ' + l.trim()); });
