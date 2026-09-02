const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => { if (l.includes('supabase.from("staff_list")') || l.includes("supabase.from('staff_list')")) console.log(i + ': ' + l.trim()); });
