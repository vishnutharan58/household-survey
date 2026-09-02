const fs = require('fs');
const txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const idx = txt.indexOf("activeTab === 'events'");
console.log(txt.substring(idx - 200, idx + 2000));
