const fs = require('fs');

function replaceRobust(txt, targetContent, replacementContent) {
  const normTxt = txt.replace(/\r\n/g, '\n');
  const normTarget = targetContent.replace(/\r\n/g, '\n');
  
  if (normTxt.includes(normTarget)) {
    return normTxt.replace(normTarget, replacementContent.replace(/\r\n/g, '\n'));
  }
  return txt;
}

let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. Change type of attendanceSubTab
const target1 = `const [attendanceSubTab, setAttendanceSubTab] = useState<'date_wise' | 'monthly' | 'staff_wise' | 'manage'>('monthly');`;
const replace1 = `const [attendanceSubTab, setAttendanceSubTab] = useState<'date_wise' | 'monthly' | 'staff_wise' | 'holidays'>('monthly');`;
txt = replaceRobust(txt, target1, replace1);

// 2. Add fetch logic
const target2 = `const { data: dbSeaMembers } = await supabase.from('sea_members_list').select('*');`;
const replace2 = `const { data: dbSeaMembers } = await supabase.from('sea_members_list').select('*');
        const { data: dbHolidays } = await supabase.from('holidays').select('*');
        if (dbHolidays) setHolidays(dbHolidays);`;
txt = replaceRobust(txt, target2, replace2);

// 3. Fix holidays state type
const target3 = `const [holidays, setHolidays] = useState<string[]>([]);`;
const replace3 = `const [holidays, setHolidays] = useState<any[]>([]);`;
txt = replaceRobust(txt, target3, replace3);

// 4. Update the map for buttons
const target4 = `                    {[
                      { id: 'date_wise', label: 'DATE WISE REPORT' },
                      { id: 'monthly', label: 'MONTHLY REPORT' },
                      { id: 'staff_wise', label: 'STAFF WISE REPORT' }
                    ].map((tab) => (`
const replace4 = `                    {[
                      { id: 'date_wise', label: 'DATE WISE REPORT' },
                      { id: 'monthly', label: 'MONTHLY REPORT' },
                      { id: 'staff_wise', label: 'STAFF WISE REPORT' },
                      { id: 'holidays', label: 'HOLIDAYS' }
                    ].map((tab) => (`
txt = replaceRobust(txt, target4, replace4);

// 5. Append Holidays UI after staff_wise
const target5 = `                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}`;
const replace5 = `                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {attendanceSubTab === 'holidays' && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' }}>
                      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                        <h3 style={{ marginTop: 0, color: '#1e293b' }}>Manage Holidays</h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Date</label>
                            <input type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Description</label>
                            <input type="text" placeholder="Holiday name" id="holiday-desc-input" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '250px' }} />
                          </div>
                          <button onClick={async () => {
                            if (!newHoliday) return;
                            const desc = document.getElementById('holiday-desc-input').value;
                            const { data, error } = await supabase.from('holidays').insert([{ holiday_date: newHoliday, description: desc }]).select();
                            if (!error && data) {
                              setHolidays([...holidays, ...data]);
                              setNewHoliday('');
                              document.getElementById('holiday-desc-input').value = '';
                            }
                          }} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Add Holiday</button>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ padding: '10px' }}>Date</th>
                              <th style={{ padding: '10px' }}>Description</th>
                              <th style={{ padding: '10px', width: '100px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {holidays.map((h, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px' }}>{new Date(h.holiday_date).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '10px' }}>{h.description}</td>
                                <td style={{ padding: '10px' }}>
                                  <button onClick={async () => {
                                    await supabase.from('holidays').delete().eq('id', h.id);
                                    setHolidays(holidays.filter(x => x.id !== h.id));
                                  }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                </td>
                              </tr>
                            ))}
                            {holidays.length === 0 && (
                              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No holidays added yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}`;
txt = replaceRobust(txt, target5, replace5);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('AdminDashboard updated for Holidays tab with robust script.');
