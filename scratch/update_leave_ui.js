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

// 1. Month and Year dropdowns
const target1 = `        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 14px', minWidth: '260px', flex: 1 }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by staff email, name or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#0f172a' }}
          />
        </div>`;
const replace1 = `        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 14px', minWidth: '260px', flex: 1 }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by staff email, name or reason..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#0f172a' }}
            />
          </div>
          <select value={leaveMonth} onChange={(e) => setLeaveMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', color: '#0f172a', background: 'white' }}>
            <option value="all">All Months</option>
            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('en', {month: 'short'})}</option>)}
          </select>
          <select value={leaveYear} onChange={(e) => setLeaveYear(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', color: '#0f172a', background: 'white' }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>`;

// 2. Buttons renaming
const target2 = `          {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
                background: filterStatus === st ? '#1B3A5C' : 'transparent',
                color: filterStatus === st ? 'white' : '#64748b',
                transition: 'all 150ms'
              }}
            >
              {st}
            </button>
          ))}`;
const replace2 = `          {([
            { id: 'all', label: 'Request' }, 
            { id: 'pending', label: 'Pending' }, 
            { id: 'approved', label: 'Approved' }, 
            { id: 'rejected', label: 'Declined' }
          ] as const).map(st => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterStatus === st.id ? '#1B3A5C' : 'transparent',
                color: filterStatus === st.id ? 'white' : '#64748b',
                transition: 'all 150ms'
              }}
            >
              {st.label}
            </button>
          ))}`;

// 3. Actions modification
const target3 = `                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
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
                    </div>
                  )}
                </div>
              );`;
const replace3 = `                  {/* Actions */}
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
                           const remoteLeaves = await fetchLeaveRequestsFromSupabase();
                           if (remoteLeaves) setLeaveRequests(remoteLeaves);
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

let r1 = replaceRobust(txt, target1, replace1);
if (r1 !== txt) console.log('Replaced target 1'); else console.log('Failed target 1');
txt = r1;

let r2 = replaceRobust(txt, target2, replace2);
if (r2 !== txt) console.log('Replaced target 2'); else console.log('Failed target 2');
txt = r2;

let r3 = replaceRobust(txt, target3, replace3);
if (r3 !== txt) console.log('Replaced target 3'); else console.log('Failed target 3');
txt = r3;

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
