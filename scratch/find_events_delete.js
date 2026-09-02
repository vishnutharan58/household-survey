const fs = require('fs');
const txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const idx = txt.indexOf("activeTab === 'events'");
const endIdx = txt.indexOf("activeTab === 'users'");
const content = txt.substring(idx, endIdx);
console.log(content.includes('Delete') ? 'Found Delete' : 'No Delete');
