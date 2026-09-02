const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const search = `<span style={{ display: 'flex', alignItems: 'center', padding: '0 6px', background: 'white', borderLeft: '1px solid #cbd5e1' }}>,</span>`;
const replace = `<span style={{ display: 'flex', alignItems: 'center', padding: '0 6px', background: 'white', borderLeft: '1px solid #cbd5e1' }}></span>`;
let count = txt.split(search).length - 1;
console.log('Matches:', count);
if (count > 0) {
  txt = txt.split(search).join(replace);
  fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
}
