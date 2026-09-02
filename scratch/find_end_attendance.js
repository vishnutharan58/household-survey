const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const lines = txt.split('\n');

const startIndex = lines.findIndex(l => l.includes("{activeTab === 'attendance' && ("));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes("{activeTab === 'sea_members' && ("));

console.log(lines.slice(endIndex - 15, endIndex + 5).join('\n'));
