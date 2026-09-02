function LeaveRequestsTab() {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest, setLeaveRequests } = useLeaveRequestStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveMonth, setLeaveMonth] = useState<string>('all');
  const [leaveYear, setLeaveYear] = useState<string>(String(new Date().getFullYear()));

  // Note Modal state
  const [modalAction, setModalAction] = useState<{ id: string; type: 'approve' | 'reject'; staffName: string } | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const remoteLeaves = await fetchLeaveRequestsFromSupabase();
        if (remoteLeaves && remoteLeaves.length > 0) {
          setLeaveRequests(remoteLeaves);
        }
      } catch (err) {
        console.error("Failed to load leave requests:", err);
      }
    };
    loadLeaves();
  }, []);

  const allRequests = Object.values(leaveRequests).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

  const filteredRequests = allRequests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || r.staffEmail.toLowerCase().includes(q) || (r.staffName && r.staffName.toLowerCase().includes(q)) || r.leaveType.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    let matchesMonth = true;
    if (leaveMonth !== 'all') {
      const ld = new Date(r.startDate);
      if (ld.getMonth() !== parseInt(leaveMonth) || ld.getFullYear() !== parseInt(leaveYear)) matchesMonth = false;
    }
    return matchesStatus && matchesSearch && matchesMonth;
  });

  const handleOpenActionModal = (id: string, type: 'approve' | 'reject', staffName: string) => {
    setModalAction({ id, type, staffName });
    setAdminNoteInput('');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAction) return;
    setProcessing(true);
    const { id, type } = modalAction;
    try {
      if (type === 'approve') {
        approveLeaveRequest(id, adminNoteInput.trim());
        await updateLeaveRequestStatusInSupabase(id, 'approved', adminNoteInput.trim());
      } else {
        rejectLeaveRequest(id, adminNoteInput.trim());
        await updateLeaveRequestStatusInSupabase(id, 'rejected', adminNoteInput.trim());
      }
      setModalAction(null);
    } catch (err) {
      console.error("Failed to update leave status:", err);
      alert("Failed to update leave status in database. Local state updated.");
      setModalAction(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B3A5C', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays color="#2A9D8F" size={28} />
            Staff Leave Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0' }}>
            Review, accept or decline staff leave applications with reasons
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Requests', count: allRequests.length, color: '#1B3A5C', bg: '#e2e8f0', icon: CalendarDays },
          { label: 'Pending Approvals', count: pendingCount, color: '#b45309', bg: '#fef3c7', icon: Clock, highlight: pendingCount > 0 },
          { label: 'Approved Leaves', count: approvedCount, color: '#065f46', bg: '#d1fae5', icon: CheckCheck },
          { label: 'Declined', count: rejectedCount, color: '#991b1b', bg: '#fee2e2', icon: XCircle },
        ].map(({ label, count, color, bg, icon: Icon, highlight }) => (
          <div
            key={label}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: highlight ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              boxShadow: highlight ? '0 4px 20px rgba(245,158,11,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{count}</p>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="chart-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
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
        </div>

        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
          {([
            { id: 'all', label: 'All Requests' }, 
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
          ))}
        </div>
      </div>

      {/* Leave Requests Cards List */}
      <div className="chart-card" style={{ padding: '24px' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <CalendarDays size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>No leave requests found</p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0' }}>
              {filterStatus !== 'all' ? `No ${filterStatus} leave requests at this time.` : 'Staff members have not submitted leave applications yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRequests.map(req => {
              const start = new Date(req.startDate);
              const end = new Date(req.endDate);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2A9D8F, #1B3A5C)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                        {(req.staffName?.[0] || req.staffEmail[0]).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {req.staffName || req.staffEmail.split('@')[0].toUpperCase()}
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          {req.staffEmail}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#e2e8f0', color: '#334155', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px' }}>
                        {req.leaveType}
                      </span>

                      {req.status === 'pending' && (
                        <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} /> Pending Review
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCheck size={13} /> Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <XCircle size={13} /> Declined
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Leave Period</p>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B3A5C', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#2A9D8F" />
                        {req.startDate} &rarr; {req.endDate} ({diffDays} {diffDays === 1 ? 'day' : 'days'})
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Requested On</p>
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0' }}>
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', margin: '0 0 4px' }}>Reason for Leave:</p>
                    <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0, background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px dashed #cbd5e1', lineHeight: 1.4 }}>
                      "{req.reason}"
                    </p>
                  </div>

                  {req.adminNote && (
                    <div style={{ background: req.status === 'approved' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${req.status === 'approved' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: req.status === 'approved' ? '#166534' : '#991b1b' }}>
                      <strong>Admin Feedback Note:</strong> {req.adminNote}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to permanently delete this leave request?")) {
                          try {
                            const supabase = getSupabase() as any;
                            await supabase.from('leave_requests').delete().eq('id', req.id);
                            // Also update local state
                            const newReqs = {...leaveRequests};
                            delete newReqs[req.id];
                            setLeaveRequests(Object.values(newReqs));
                          } catch (e) {
                            console.error(e);
                            alert("Failed to delete request");
                          }
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1',
                        borderRadius: '8px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
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
                          <XCircle size={15} /> Decline
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
                          <CheckCheck size={15} /> Accept
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Action (Approve / Reject) Modal */}
      {modalAction && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: modalAction.type === 'approve' ? '#065f46' : '#991b1b' }}>
                {modalAction.type === 'approve' ? 'Accept Leave Request' : 'Decline Leave Request'}
              </h3>
              <button onClick={() => setModalAction(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 16px' }}>
              You are about to {modalAction.type === 'approve' ? 'approve' : 'decline'} the leave request for <strong>{modalAction.staffName}</strong>.
            </p>

            <form onSubmit={handleConfirmAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Admin Note / Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder={modalAction.type === 'approve' ? 'Add approval note (e.g. Approved. Duty covered by Suganya)' : 'Add reason for declining request...'}
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#f8fafc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: '9px 20px', borderRadius: '10px', border: 'none',
                    background: modalAction.type === 'approve' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Saving...' : modalAction.type === 'approve' ? 'Confirm Approval' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}