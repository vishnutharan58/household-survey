const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const lines = txt.split('\n');

const startIndex = lines.findIndex(l => l.includes("{activeTab === 'attendance' && ("));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes("{activeTab === 'sea_members' && ("));

let attendanceSection = lines.slice(startIndex, endIndex).join('\n');

const usageLines = [];
lines.slice(startIndex, endIndex).forEach((l, i) => {
  if (l.includes('staffList')) {
    usageLines.push((startIndex + i) + ': ' + l.trim());
  }
});
console.log(usageLines.join('\n'));
