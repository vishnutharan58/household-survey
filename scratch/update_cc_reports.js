const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/pages/Admin/AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStart = `{activeTab === 'collectives' && (
                <div>`;

const tabsCode = `
                  <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <button onClick={() => setCcSubTab('overview')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'overview' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'overview' ? '#1B3A5C' : '#64748b' }}>Overview</button>
                    <button onClick={() => setCcSubTab('monthly')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'monthly' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'monthly' ? '#1B3A5C' : '#64748b' }}>Month-wise Report</button>
                    <button onClick={() => setCcSubTab('yearly')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'yearly' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'yearly' ? '#1B3A5C' : '#64748b' }}>Year-wise Report</button>
                    <button onClick={() => setCcSubTab('staff_wise')} style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', borderBottom: ccSubTab === 'staff_wise' ? '3px solid #2A9D8F' : '3px solid transparent', color: ccSubTab === 'staff_wise' ? '#1B3A5C' : '#64748b' }}>Staff-wise Report</button>
                  </div>

                  {ccSubTab === 'overview' && (
                    <div>`;

code = code.replace(targetStart, targetStart + tabsCode);


const endTarget = `                    ))}
                  </div>
                </div>
              )}

              {/*  ATTENDANCE TAB  */}`;

const reportsCode = `                    ))}
                  </div>
                    </div>
                  )}

                  {ccSubTab !== 'overview' && (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          
                          {ccSubTab === 'monthly' && (
                            <input 
                              type="month" 
                              value={ccMonthFilter} 
                              onChange={e => setCcMonthFilter(e.target.value)} 
                              style={{ padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                            />
                          )}

                          {ccSubTab === 'yearly' && (
                            <select 
                              value={ccYearFilter}
                              onChange={e => setCcYearFilter(e.target.value)}
                              style={{ padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                            >
                              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          )}

                          {ccSubTab === 'staff_wise' && (
                            <>
                              <input 
                                type="month" 
                                value={ccMonthFilter} 
                                onChange={e => setCcMonthFilter(e.target.value)} 
                                style={{ padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                              />
                              <select 
                                value={ccStaffFilter}
                                onChange={e => setCcStaffFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', minWidth: '150px' }}
                              >
                                <option value="all">All Staff</option>
                                {Array.from(new Set(ccMeetingsLog.map(l => l.staff_email))).filter(Boolean).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </>
                          )}

                        </div>
                        <button onClick={() => handleExportXLS('CC_Meetings_Report')} style={{ padding: '8px 16px', background: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(56,189,248,0.2)' }}>EXPORT AS XLS</button>
                      </div>

                      <div style={{ overflowX: 'auto', padding: '20px' }}>
                        <table id="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Date</th>
                              {ccSubTab !== 'staff_wise' && <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Staff Email</th>}
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Collective ID</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Collective Name</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Participants Added</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let filtered = ccMeetingsLog;
                              
                              if (ccSubTab === 'monthly') {
                                filtered = filtered.filter(l => l.meeting_date?.startsWith(ccMonthFilter));
                              } else if (ccSubTab === 'yearly') {
                                filtered = filtered.filter(l => l.meeting_date?.startsWith(ccYearFilter));
                              } else if (ccSubTab === 'staff_wise') {
                                filtered = filtered.filter(l => l.meeting_date?.startsWith(ccMonthFilter) && (ccStaffFilter === 'all' || l.staff_email === ccStaffFilter));
                              }

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No CC Meetings found for this period.</td>
                                  </tr>
                                );
                              }

                              return filtered.map((log, i) => (
                                <tr key={log.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1B3A5C' }}>{log.meeting_date}</td>
                                  {ccSubTab !== 'staff_wise' && <td style={{ padding: '12px 16px', color: '#475569' }}>{log.staff_email}</td>}
                                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{log.collective_id}</td>
                                  <td style={{ padding: '12px 16px', color: '#475569' }}>{log.collective_name}</td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#2A9D8F' }}>+{log.participants_added}</td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/*  ATTENDANCE TAB  */}`;

code = code.replace(endTarget, reportsCode);

fs.writeFileSync(file, code);
console.log('AdminDashboard.tsx updated with CC Reports tab');
