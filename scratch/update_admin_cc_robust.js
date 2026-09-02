const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/pages/Admin/AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. State hooks
if (!code.includes('isEditCcLogModalOpen')) {
  code = code.replace(
    `const [ccStaffFilter, setCcStaffFilter] = useState<string>('all');`,
    `const [ccStaffFilter, setCcStaffFilter] = useState<string>('all');\n  const [isEditCcLogModalOpen, setIsEditCcLogModalOpen] = useState(false);\n  const [editingCcLog, setEditingCcLog] = useState<any>(null);`
  );
}

// 2. Handlers
const handlersCode = `
  const handleDeleteCcLog = async (id: string, e: any) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this CC meeting log?")) return;
    try {
      const supabase = getSupabase() as any;
      await supabase.from('cc_meetings_log').delete().eq('id', id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete cc log:", err);
    }
  };

  const handleSaveCcLog = async () => {
    try {
      const supabase = getSupabase() as any;
      await supabase.from('cc_meetings_log').update({
        start_date: editingCcLog.start_date,
        end_date: editingCcLog.end_date,
        village: editingCcLog.village,
        meeting_date: editingCcLog.meeting_date,
        participants_added: editingCcLog.participants_added
      }).eq('id', editingCcLog.id);
      setIsEditCcLogModalOpen(false);
      await loadData();
    } catch(e) {
      console.error(e);
      alert('Error updating CC log');
    }
  };
`;
if (!code.includes('handleDeleteCcLog')) {
  code = code.replace('const handleDeleteCollective = async', handlersCode + '\n  const handleDeleteCollective = async');
}

// 3. UI Replacement
const startMarker = `{/* ─── COMMUNITY COLLECTIVES TAB ─── */}`;
const endMarker = `{/* ─── OTHER SERVICES TAB ─── */}`;

let startIndex = code.indexOf(startMarker);
let endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end markers for CC tab");
  process.exit(1);
}

const newTabCode = `{/* ─── COMMUNITY COLLECTIVES TAB ─── */}
              {activeTab === 'collectives' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B3A5C', margin: 0 }}>Community Collectives (CC)</h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', margin: 0 }}>Manage the detailed logs of all CC meetings</p>
                    </div>
                    <button onClick={() => handleExportXLS('CC_Meeting_Logs')} style={{ padding: '8px 16px', background: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(56,189,248,0.2)' }}>EXPORT AS XLS</button>
                  </div>
                  
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', padding: '20px' }}>
                      <table id="cc-meetings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>S.No</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>CC Meeting Date</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Start Date/Time</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>End Date/Time</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Village</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Staff Name</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Total Participants</th>
                            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ccMeetingsLog.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No meetings logged yet.</td></tr>
                          ) : ccMeetingsLog.map((log, i) => (
                            <tr key={log.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1B3A5C' }}>{i + 1}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1B3A5C' }}>{log.meeting_date}</td>
                              <td style={{ padding: '12px 16px', color: '#475569' }}>{log.start_date || '—'}</td>
                              <td style={{ padding: '12px 16px', color: '#475569' }}>{log.end_date || '—'}</td>
                              <td style={{ padding: '12px 16px', color: '#475569' }}>{log.village || log.collective_name}</td>
                              <td style={{ padding: '12px 16px', color: '#475569' }}>{log.staff_email}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#2A9D8F' }}>{log.participants_added}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                  <button onClick={() => { setEditingCcLog(log); setIsEditCcLogModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit size={16} /></button>
                                  <button onClick={(e) => handleDeleteCcLog(log.id, e)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              `;

code = code.substring(0, startIndex) + newTabCode + code.substring(endIndex);

// 4. Add Modal
const modalCode = `
      {isEditCcLogModalOpen && editingCcLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setIsEditCcLogModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B3A5C', margin: '0 0 24px' }}>Edit CC Meeting Log</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Meeting Date</label>
                <input type="date" value={editingCcLog.meeting_date || ''} onChange={e => setEditingCcLog({...editingCcLog, meeting_date: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Start Date/Time</label>
                <input type="text" value={editingCcLog.start_date || ''} onChange={e => setEditingCcLog({...editingCcLog, start_date: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>End Date/Time</label>
                <input type="text" value={editingCcLog.end_date || ''} onChange={e => setEditingCcLog({...editingCcLog, end_date: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Village</label>
                <input type="text" value={editingCcLog.village || ''} onChange={e => setEditingCcLog({...editingCcLog, village: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Participants</label>
                <input type="number" value={editingCcLog.participants_added || 0} onChange={e => setEditingCcLog({...editingCcLog, participants_added: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setIsEditCcLogModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveCcLog} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
`;
if (!code.includes('isEditCcLogModalOpen && editingCcLog')) {
  const lastDivIndex = code.lastIndexOf('</div>');
  code = code.substring(0, lastDivIndex) + modalCode + code.substring(lastDivIndex);
}

fs.writeFileSync(file, code);
console.log('Successfully updated AdminDashboard.tsx!');
