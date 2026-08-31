const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/pages/Admin/AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Add state variables for editing cc logs
const stateHookTarget = `const [ccStaffFilter, setCcStaffFilter] = useState<string>('all');`;
const newStates = `const [isEditCcLogModalOpen, setIsEditCcLogModalOpen] = useState(false);
  const [editingCcLog, setEditingCcLog] = useState<any>(null);`;
if (!code.includes('isEditCcLogModalOpen')) {
  code = code.replace(stateHookTarget, `${stateHookTarget}\n  ${newStates}`);
}

// 2. Add Delete logic
const loadDataTarget = `const handleDeleteCollective = async`;
const deleteLogLogic = `
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
  code = code.replace(loadDataTarget, deleteLogLogic + loadDataTarget);
}

// 3. Update the UI for the main CC tab
// I need to replace the entire 'overview' sub-tab with a new table.
// And update the button text from 'Overview' to 'Meeting Logs'.

code = code.replace(
  `<button onClick={() => setCcSubTab('overview')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'overview' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'overview' ? '#1B3A5C' : '#64748b' }}>Overview</button>`,
  `<button onClick={() => setCcSubTab('overview')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'overview' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'overview' ? '#1B3A5C' : '#64748b' }}>Meeting Logs</button>`
);

const oldOverviewStart = `{ccSubTab === 'overview' && (
                    <div>`;
const oldOverviewEnd = `                    ))}
                  </div>
                    </div>
                  )}`;

const newOverviewTable = `{ccSubTab === 'overview' && (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Recent Meeting Logs</h4>
                        <button onClick={() => handleExportXLS('CC_Meeting_Logs')} style={{ padding: '8px 16px', background: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(56,189,248,0.2)' }}>EXPORT AS XLS</button>
                      </div>
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
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Participants</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ccMeetingsLog.length === 0 ? (
                               <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No logs found.</td></tr>
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
                  )}`;

// The problem with string replacement here is that `oldOverviewStart` to `oldOverviewEnd` spans many lines, and my hardcoded string might not match exactly due to indentation.
// So I will use regex or slice.

let startIndex = code.indexOf(oldOverviewStart);
let endIndex = code.indexOf(oldOverviewEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex + oldOverviewEnd.length);
  code = before + newOverviewTable + after;
} else {
  console.error("Could not find the block to replace.");
}


// 4. Add the Modal for editing
const modalCode = `
      {isEditCcLogModalOpen && editingCcLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setIsEditCcLogModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B3A5C', margin: '0 0 24px' }}>Edit CC Meeting Log</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Meeting Date</label>
                <input type="date" value={editingCcLog.meeting_date} onChange={e => setEditingCcLog({...editingCcLog, meeting_date: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
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
  // Insert before final closing tag (usually before last `</div>`)
  const lastDivIndex = code.lastIndexOf('</div>');
  code = code.substring(0, lastDivIndex) + modalCode + code.substring(lastDivIndex);
}

fs.writeFileSync(file, code);
console.log('AdminDashboard.tsx updated');
