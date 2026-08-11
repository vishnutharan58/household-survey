const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const collectiveCardInsert = `<div>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Membership</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{c.membership_count || 0}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Meetings</span>`;

txt = txt.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>\n                            <div>\n                              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Meetings</span>",
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>\n                            " + collectiveCardInsert
);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Fixed Collective Cards in AdminDashboard.');
