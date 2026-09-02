const fs = require('fs');
const lines = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('function LeaveRequestsTab()'));
const endIdx = lines.findIndex((l, i) => i > idx && l.includes('function UsersManagementTab()'));
const content = lines.slice(idx, endIdx).join('\n');
const actionIdx = content.indexOf('approve');
console.log(content.substring(actionIdx - 300, actionIdx + 1300));
