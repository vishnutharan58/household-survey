const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/pages/Staff/StaffDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `const [ccFormData, setCcFormData] = useState({ meetings_conducted: '', participants_count: '' });`,
  `const [ccFormData, setCcFormData] = useState({ participants_count: '', meeting_date: '', start_date: '', end_date: '', village: '' });`
);

code = code.replace(
  `setCcFormData({ meetings_conducted: '', participants_count: '' });`,
  `setCcFormData({ participants_count: '', meeting_date: '', start_date: '', end_date: '', village: '' });`
);

code = code.replace(
  `                          setCcFormData({
                            meetings_conducted: '',
                            participants_count: ''
                          });`,
  `                          setCcFormData({
                            participants_count: '',
                            meeting_date: '',
                            start_date: '',
                            end_date: '',
                            village: cc.name // default to collective name
                          });`
);

// Update handleSaveCc logic
const oldInsert = `      const dateStr = new Date().toISOString().split('T')[0];
      const { error: logError } = await supabase.from('cc_meetings_log').insert([{
        collective_id: cc.id,
        collective_name: cc.name,
        staff_email: user?.email,
        meeting_date: dateStr,
        participants_added: participantsAdded
      }]);`;

const newInsert = `      const { error: logError } = await supabase.from('cc_meetings_log').insert([{
        collective_id: cc.id,
        collective_name: cc.name,
        staff_email: user?.email,
        meeting_date: ccFormData.meeting_date || new Date().toISOString().split('T')[0],
        participants_added: participantsAdded,
        start_date: ccFormData.start_date,
        end_date: ccFormData.end_date,
        village: ccFormData.village
      }]);`;

code = code.replace(oldInsert, newInsert);

// Update UI
const oldUIStart = `                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Membership Count</label>
                      <input 
                        type="text" 
                        value={ccList.find(c => c.id === selectedCcId)?.membership_count || 0} 
                        readOnly
                        disabled
                        style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', fontWeight: 600 }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Participants (Add)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={ccFormData.participants_count} 
                        onChange={e => setCcFormData({ ...ccFormData, participants_count: e.target.value })}
                        style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                  </div>`;

const newUIStart = `                  <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Meeting Date</label>
                        <input 
                          type="date" 
                          value={ccFormData.meeting_date} 
                          onChange={e => setCcFormData({ ...ccFormData, meeting_date: e.target.value })}
                          style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Village</label>
                        <input 
                          type="text" 
                          value={ccFormData.village} 
                          onChange={e => setCcFormData({ ...ccFormData, village: e.target.value })}
                          style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Start Date/Time</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10:00 AM or 12-Aug"
                          value={ccFormData.start_date} 
                          onChange={e => setCcFormData({ ...ccFormData, start_date: e.target.value })}
                          style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>End Date/Time</label>
                        <input 
                          type="text"
                          placeholder="e.g. 02:00 PM or 12-Aug"
                          value={ccFormData.end_date} 
                          onChange={e => setCcFormData({ ...ccFormData, end_date: e.target.value })}
                          style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Participants (Add)</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={ccFormData.participants_count} 
                          onChange={e => setCcFormData({ ...ccFormData, participants_count: e.target.value })}
                          style={{ padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>`;

code = code.replace(oldUIStart, newUIStart);

fs.writeFileSync(file, code);
console.log('StaffDashboard.tsx updated with new CC fields');
