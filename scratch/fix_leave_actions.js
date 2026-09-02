const fs = require('fs');

let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const targetStr = `                  {/* Actions */}`;

const idx = txt.indexOf(targetStr);
if (idx !== -1) {
  const endIdx = txt.indexOf('              );', idx);
  const oldBlock = txt.substring(idx, endIdx + 16);
  
  const newBlock = `                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', marginTop: 'auto', borderTop: '1px solid #e2e8f0' }}>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOpenActionModal(req.id, 'reject', req.staffName || req.staffEmail)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
                            borderRadius: '8px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 150ms'
                          }}
                        >
                          <XCircle size={15} /> Decline Request
                        </button>

                        <button
                          onClick={() => handleOpenActionModal(req.id, 'approve', req.staffName || req.staffEmail)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(16,185,129,0.3)', transition: 'all 150ms'
                          }}
                        >
                          <CheckCheck size={15} /> Approve
                        </button>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to completely delete this leave request?')) {
                           const s = getSupabase();
                           await s.from('leave_requests').delete().eq('id', req.id);
                           const remoteLeaves = await window.fetchLeaveRequestsFromSupabase?.() || []; // Or we can use the fetchLeaveRequestsFromSupabase imported at the top!
                           setLeaveRequests(remoteLeaves);
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'transparent', color: '#ef4444', border: '1px solid #fecaca',
                        borderRadius: '8px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );`;
              
  txt = txt.replace(oldBlock, newBlock);
  fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
  console.log('Replaced block successfully');
} else {
  console.log('Could not find target');
}
