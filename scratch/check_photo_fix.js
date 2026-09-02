const fs = require('fs');
const txt = fs.readFileSync('apps/web/src/pages/Staff/StaffDashboard.tsx', 'utf8');
console.log(txt.includes("supabase.storage.from('event-images')") ? 'Photo fix present' : 'Photo fix missing');
