const fs = require('fs');
const lines = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('function LeaveRequestsTab'));
if (idx === -1) {
  const inlineIdx = lines.findIndex(l => l.includes("activeTab === 'leave'"));
  console.log('No LeaveRequestsTab component found. activeTab leave at line:', inlineIdx);
} else {
  console.log('LeaveRequestsTab component at line:', idx);
}
