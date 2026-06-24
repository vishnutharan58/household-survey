// Removed unused React import
import { useState, useEffect } from 'react';
import { useAuthStore, useDraftStore, useEditRequestStore, syncDraftToSupabase, getSupabase, fetchSurveyDetail } from '@pro-vision-care/shared';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, FileText, UploadCloud, MapPin, CheckCircle2, Clock, Pencil, Send, CheckCheck, XCircle, AlertCircle, ChevronDown } from 'lucide-react';

// Hamlet codes per staff — mirrors Login.tsx
const STAFF_HAMLET_MAP: Record<string, string[]> = {
  'suganya@staff.com':  ['1.1','1.2','1.3','2.1','2.2','2.3','2.4','2.5','2.6','2.7'],
  'freeda@staff.com':   ['3.1','3.2','3.3','4.1','4.2','4.3','4.4','4.5','6.1','6.2','6.3'],
  'berdina@staff.com':  ['5.1','5.2','5.3','7.1','7.2','7.3','8.1','8.2','8.3','9.1','9.2','9.3'],
  'fernisha@staff.com': ['10.1','10.2','11.1','11.2','11.3','11.4','11.5','11.6','11.7'],
  'vijini@staff.com':   ['12.1','12.2','12.3','12.4','12.5','12.6','12.7','13.1','13.2','13.3'],
  'raksha@staff.com':   ['14.1','14.2','15.1','15.2','15.3','15.4','15.5','16.1','16.2','17.1','17.2','17.3'],
};

export default function StaffDashboard() {
  const { user, hamlet_code, signOut, setHamletCode } = useAuthStore();
  const { drafts, clearSynced } = useDraftStore();
  const { requests, requestEdit } = useEditRequestStore();
  const navigate = useNavigate();
  const [hamletOpen, setHamletOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedSurveys, setSyncedSurveys] = useState<any[]>([]);
  const [loadingSynced, setLoadingSynced] = useState(false);

  const staffHamlets = user?.email ? (STAFF_HAMLET_MAP[user.email] ?? []) : [];

  // Auto-initialize hamlet_code if it is not in the user's assigned hamlets list (e.g. placeholder 'HAM-001')
  useEffect(() => {
    const autoInitializeHamlet = async () => {
      if (!user?.email || staffHamlets.length === 0) return;
      if (!hamlet_code || !staffHamlets.includes(hamlet_code)) {
        const defaultHamlet = staffHamlets[0];
        setHamletCode(defaultHamlet);
        try {
          const supabase = getSupabase();
          const { error: updateErr } = await supabase.auth.updateUser({ data: { hamlet_code: defaultHamlet } });
          if (updateErr) throw updateErr;

          const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
          if (refreshErr) throw refreshErr;

          if (refreshData.session) {
            useAuthStore.getState().setAuth(refreshData.session);
          }
        } catch (err) {
          console.error('Failed to auto-initialize hamlet code:', err);
        }
      }
    };

    autoInitializeHamlet();
  }, [user?.email, hamlet_code, staffHamlets, setHamletCode]);

  useEffect(() => {
    const loadSyncedSurveys = async () => {
      if (!user?.email || !hamlet_code) return;
      setLoadingSynced(true);
      try {
        const supabase = getSupabase();
        
        const staffPrefix = user.email.split('@')[0];
        const staffNameCapitalized = staffPrefix.charAt(0).toUpperCase() + staffPrefix.slice(1);

        const { data, error } = await supabase
          .from('households')
          .select('id, household_number, hamlet_code, staff_name, date, created_at')
          .eq('hamlet_code', hamlet_code)
          .or(`staff_name.eq."${user.email}",staff_name.eq."${staffNameCapitalized}",staff_name.eq."${staffPrefix}"`);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const hhIds = data.map((h: any) => h.id);
          const { data: members, error: memErr } = await supabase
            .from('members')
            .select('household_id')
            .in('household_id', hhIds);
            
          if (memErr) throw memErr;
          
          const countsMap: Record<string, number> = {};
          members.forEach((m: any) => {
            if (m.household_id) {
              countsMap[m.household_id] = (countsMap[m.household_id] || 0) + 1;
            }
          });
          
          const surveys = data.map((h: any) => ({
            id: h.id,
            household: h,
            members: Array.from({ length: countsMap[h.id] || 0 }, () => ({})),
            lastSavedAt: h.created_at,
            status: 'synced' as const
          }));
          
          setSyncedSurveys(surveys);
        } else {
          setSyncedSurveys([]);
        }
      } catch (err) {
        console.error('Failed to load synced surveys:', err);
      } finally {
        setLoadingSynced(false);
      }
    };

    loadSyncedSurveys();
  }, [user?.email, hamlet_code]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      for (const draft of pendingDrafts) {
        await syncDraftToSupabase(draft);
        useDraftStore.getState().markAsSynced(draft.id);
      }
      alert('Sync completed successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error during sync: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };



  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const staffDrafts = Object.values(drafts).filter(d => d.household.staff_name === user?.email);
  const pendingDrafts = staffDrafts.filter(d => d.status === 'draft' || d.status === 'pending_sync');
  const localSyncedDrafts = staffDrafts.filter(d => d.status === 'synced');

  // Merge local synced drafts and fetched database surveys, deduplicating by ID
  const allSyncedMap = new Map<string, any>();
  syncedSurveys.forEach(s => allSyncedMap.set(s.id, s));
  localSyncedDrafts.forEach(d => allSyncedMap.set(d.id, d));
  
  const syncedDrafts = Array.from(allSyncedMap.values()).sort(
    (a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
  );

  const handleOpenSurvey = async (survey: any) => {
    if (survey.status !== 'synced') {
      navigate(`/staff/survey/${survey.id}`);
      return;
    }
    try {
      const fullDetail = await fetchSurveyDetail(survey.id);
      navigate(`/staff/survey/${survey.id}`, { state: { survey: fullDetail } });
    } catch (err) {
      console.error('Failed to load survey details:', err);
      navigate(`/staff/survey/${survey.id}`);
    }
  };

  const handleRequestEdit = (draft: typeof syncedDrafts[0], e: React.MouseEvent) => {
    e.stopPropagation();
    requestEdit({
      id: draft.id,
      surveyId: draft.id,
      staffEmail: user?.email || '',
      householdNumber: draft.household.household_number,
      hamletCode: draft.household.hamlet_code,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Navbar */}
      <nav className="navbar-glass">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.jpeg"
              alt="Logo"
              style={{ height: '36px', width: 'auto', borderRadius: '50%', background: 'white', padding: '2px', border: '2px solid rgba(42,157,143,0.5)' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                PRO-VISION CARE
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Staff Portal
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '5px 14px 5px 5px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#FFB703,#E76F51)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                {user?.email?.[0]?.toUpperCase() ?? 'S'}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
            </div>
            <button
              id="staff-signout"
              onClick={handleSignOut}
              title="Sign out"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 220ms ease' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome banner */}
        <div
          className="animate-fade-in-up"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #1B3A5C 0%, #0f3d38 100%)',
            padding: '28px 32px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 8px 32px rgba(27,58,92,0.3)',
          }}
        >
          {/* subtle bg detail */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(42,157,143,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,183,3,0.08)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
              Staff Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <MapPin size={14} color="#2A9D8F" />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Active Hamlet:</span>

              {/* Hamlet switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  id="hamlet-switcher"
                  onClick={() => setHamletOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(42,157,143,0.22)',
                    border: '1px solid rgba(42,157,143,0.5)',
                    color: '#34d399',
                    padding: '3px 10px 3px 12px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: staffHamlets.length > 1 ? 'pointer' : 'default',
                  }}
                >
                  {hamlet_code || 'Not Assigned'}
                  {staffHamlets.length > 1 && <ChevronDown size={12} />}
                </button>

                {/* Dropdown list */}
                {hamletOpen && staffHamlets.length > 1 && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                      background: 'white', borderRadius: '14px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                      border: '1px solid #e2e8f0',
                      zIndex: 200,
                      display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
                      gap: '6px', padding: '10px 12px',
                      maxWidth: '480px',
                    }}
                  >
                    {staffHamlets.map(code => (
                      <button
                        key={code}
                        onClick={async () => {
                          setHamletCode(code);
                          setHamletOpen(false);
                          try {
                            const supabase = getSupabase();
                            const { error: updateErr } = await supabase.auth.updateUser({ data: { hamlet_code: code } });
                            if (updateErr) throw updateErr;

                            // Refresh session to obtain a new JWT token containing the updated hamlet_code claim
                            const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
                            if (refreshErr) throw refreshErr;

                            if (refreshData.session) {
                              useAuthStore.getState().setAuth(refreshData.session);
                            }
                          } catch (err) {
                            console.error('Failed to update hamlet on server:', err);
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '999px',
                          border: code === hamlet_code ? '1.5px solid #2A9D8F' : '1.5px solid #e2e8f0',
                          background: code === hamlet_code ? 'linear-gradient(135deg,#2A9D8F,#1B3A5C)' : '#f8fafc',
                          color: code === hamlet_code ? 'white' : '#374151',
                          fontWeight: code === hamlet_code ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 120ms',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            id="staff-new-survey"
            onClick={() => navigate('/staff/survey/new')}
            style={{
              background: 'linear-gradient(135deg, #2A9D8F, #22b5a5)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '13px 24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(42,157,143,0.5)',
              transition: 'all 220ms ease',
              position: 'relative',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,157,143,0.65)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(42,157,143,0.5)'; }}
          >
            <PlusCircle size={20} />
            New Survey Entry
          </button>
        </div>

        {/* Quick stats row */}
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Pending Drafts', value: pendingDrafts.length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Synced Entries', value: syncedDrafts.length, color: '#10b981', bg: '#d1fae5' },
            { label: 'Total Entries', value: Object.keys(drafts).length, color: '#3b82f6', bg: '#dbeafe' },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="animate-fade-in-up"
              style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                <span style={{ display: 'inline-block', background: bg, color, borderRadius: '8px', padding: '2px 10px', fontSize: '1.6rem' }}>
                  {value}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Draft / Synced lists */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

          {/* Pending Drafts */}
          <div className="chart-card animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                <Clock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                Drafts & Pending
                <span
                  style={{ background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', marginLeft: '4px' }}
                >
                  {pendingDrafts.length}
                </span>
              </h2>
              {pendingDrafts.length > 0 && (
                <button
                  id="staff-sync-all"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1B3A5C', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: isSyncing ? 'not-allowed' : 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 150ms', opacity: isSyncing ? 0.6 : 1 }}
                  onMouseOver={e => !isSyncing && (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseOut={e => !isSyncing && (e.currentTarget.style.background = 'none')}
                >
                  <UploadCloud size={15} className={isSyncing ? 'animate-pulse' : ''} /> {isSyncing ? 'Syncing...' : 'Sync All'}
                </button>
              )}
            </div>

            {pendingDrafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <FileText size={40} color="#e2e8f0" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No pending drafts</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingDrafts.map(draft => (
                  <li
                    key={draft.id}
                    className="draft-item"
                    onClick={() => navigate(`/staff/survey/${draft.id}`)}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '0.9rem' }}>
                        Household: {draft.household.household_number || 'Unnamed'}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '3px 0 0' }}>
                        Last saved: {new Date(draft.lastSavedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge ${draft.status === 'pending_sync' ? 'badge-sync' : 'badge-draft'}`}>
                      {draft.status === 'pending_sync' ? 'Ready' : 'Draft'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Synced */}
          <div className="chart-card animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                Recent Submissions
                <span
                  style={{ background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', marginLeft: '4px' }}
                >
                  {syncedDrafts.length}
                </span>
                {loadingSynced && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px', fontWeight: 400 }}>Loading...</span>}
              </h2>
              {localSyncedDrafts.length > 0 && (
                <button
                  id="staff-clear-synced"
                  onClick={clearSynced}
                  style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 150ms' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseOut={e => (e.currentTarget.style.background = 'none')}
                >
                  Clear Local
                </button>
              )}
            </div>

            {syncedDrafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <CheckCircle2 size={40} color="#e2e8f0" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No submissions yet</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {syncedDrafts.map(draft => {
                  const req = requests[draft.id];
                  const reqStatus = req?.status;

                  return (
                    <li
                      key={draft.id}
                      className="draft-item"
                      onClick={() => handleOpenSurvey(draft)}
                      style={{ border: '1.5px solid #d1fae5', background: '#f0fdf9', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}
                      onMouseOver={e => { (e.currentTarget as HTMLLIElement).style.borderColor = '#2A9D8F'; (e.currentTarget as HTMLLIElement).style.background = '#e0faf6'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLLIElement).style.borderColor = '#d1fae5'; (e.currentTarget as HTMLLIElement).style.background = '#f0fdf9'; }}
                    >
                      {/* Row 1: title + synced badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '0.9rem' }}>
                            Household: {draft.household.household_number || 'Unnamed'}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '3px 0 0' }}>
                            Submitted: {new Date(draft.lastSavedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="badge badge-synced">✓ Synced</span>
                      </div>

                      {/* Row 2: edit request section */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #bbf7d0' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Status indicator */}
                        {!req && (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No edit request</span>
                        )}
                        {reqStatus === 'pending' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                            <AlertCircle size={13} />
                            Edit request pending admin approval
                          </div>
                        )}
                        {reqStatus === 'approved' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>
                            <CheckCheck size={13} />
                            Edit approved by admin
                          </div>
                        )}
                        {reqStatus === 'rejected' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>
                            <XCircle size={13} />
                            Request rejected{req.reviewNote ? ` — ${req.reviewNote}` : ''}
                          </div>
                        )}

                        {/* Action button */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                          {/* View button always available */}
                          <button
                            onClick={() => handleOpenSurvey(draft)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2A9D8F', fontWeight: 600, background: 'rgba(42,157,143,0.1)', padding: '4px 10px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
                          >
                            <Pencil size={11} /> View
                          </button>

                          {/* Request edit — only when no pending/approved request */}
                          {(!req || reqStatus === 'rejected') && (
                            <button
                              onClick={(e) => handleRequestEdit(draft, e)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#1B3A5C', fontWeight: 700, background: 'rgba(27,58,92,0.1)', padding: '4px 10px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
                            >
                              <Send size={11} /> Request Edit
                            </button>
                          )}

                          {/* Edit — only when approved */}
                          {reqStatus === 'approved' && (
                            <button
                              onClick={() => handleOpenSurvey(draft)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg,#2A9D8F,#1B3A5C)', padding: '4px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(42,157,143,0.35)' }}
                            >
                              <Pencil size={11} /> Edit Survey
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
