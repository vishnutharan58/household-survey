const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Staff/StaffDashboard.tsx', 'utf8');

// 1. handleAddNewCc initialization
txt = txt.replace(
  "setCcList([...ccList, { name: '', meetings_conducted: 0, participants_count: 0 }]);",
  "setCcList([...ccList, { name: '', membership_count: 0, meetings_conducted: 0, participants_count: 0 }]);"
);

// 2. handleSaveCc update
txt = txt.replace(
  "meetings_conducted: cc.meetings_conducted,",
  "membership_count: cc.membership_count,\n          meetings_conducted: cc.meetings_conducted,"
);

// 3. handleSaveCc insert
txt = txt.replace(
  "meetings_conducted: cc.meetings_conducted || 0,",
  "membership_count: cc.membership_count || 0,\n          meetings_conducted: cc.meetings_conducted || 0,"
);

// 4. Modal Header updates (grid template from 1fr 60px 80px to 1fr 80px 80px 80px)
txt = txt.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '10px', marginBottom: '8px', padding: '0 10px' }}>",
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: '10px', marginBottom: '8px', padding: '0 10px' }}>"
);
txt = txt.replace(
  "<span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meetings</span>",
  "<span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Members</span>\n                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meetings</span>"
);

// 5. Modal Row updates
txt = txt.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '10px' }}>",
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: '10px' }}>"
);

const membershipInput = `
                      <div>
                        <input 
                          type="number" 
                          placeholder="Members"
                          value={cc.membership_count || 0} 
                          onChange={(e) => {
                            const newList = [...ccList];
                            newList[i].membership_count = parseInt(e.target.value) || 0;
                            setCcList(newList);
                          }} 
                          style={{ width: '80px', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                      </div>`;
                      
txt = txt.replace(
  `<div>
                        <input 
                          type="number" 
                          placeholder="Mtgs"`,
  membershipInput.trim() + `\n                      <div>\n                        <input \n                          type="number" \n                          placeholder="Mtgs"`
);

fs.writeFileSync('apps/web/src/pages/Staff/StaffDashboard.tsx', txt);
console.log('StaffDashboard.tsx updated with membership_count!');
