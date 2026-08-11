const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. EditCollectiveModal State
txt = txt.replace(
  "const [name, setName] = useState(collective?.name || '');",
  "const [name, setName] = useState(collective?.name || '');\n  const [membershipCount, setMembershipCount] = useState(collective?.membership_count?.toString() || '0');"
);

// 2. handleFormSubmit in EditCollectiveModal
txt = txt.replace(
  "meetings_conducted: parseInt(meetingsConducted, 10) || 0,",
  "membership_count: parseInt(membershipCount, 10) || 0,\n      meetings_conducted: parseInt(meetingsConducted, 10) || 0,"
);

// 3. EditCollectiveModal UI Input Fields
const collectiveInputInsert = `
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Membership Count</label>
            <input 
              type="number" 
              value={membershipCount} 
              onChange={e => setMembershipCount(e.target.value)} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
            />
          </div>`;
          
txt = txt.replace(
  "<label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Meetings Conducted</label>",
  collectiveInputInsert.trim() + "\n          <div style={{ marginBottom: '16px' }}>\n            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Meetings Conducted</label>"
);

// 4. Collective Card UI
const collectiveCardInsert = `<div>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Membership</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{c.membership_count}</span>
                            </div>
                            `;
                            
txt = txt.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>",
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>\n                            " + collectiveCardInsert
);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('AdminDashboard.tsx updated with membership_count!');
