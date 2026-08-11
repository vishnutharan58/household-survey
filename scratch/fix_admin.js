const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const correctBlock = `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Membership Count</label>
              <input type="number" value={membershipCount} onChange={e => setMembershipCount(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Meetings Conducted</label>
              <input type="number" value={meetingsConducted} onChange={e => setMeetingsConducted(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Participants Count</label>
              <input type="number" value={participantsCount} onChange={e => setParticipantsCount(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} />
            </div>
          </div>`;

const lines = txt.split('\n');
lines.splice(904, 20, correctBlock); // replace lines 905 to 924 (0-indexed 904 to 923)

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', lines.join('\n'));
console.log('Fixed JSX structure in AdminDashboard.');
