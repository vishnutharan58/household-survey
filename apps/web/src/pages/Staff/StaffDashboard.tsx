// Removed unused React import
import { useState, useEffect } from 'react';
import { useAuthStore, useDraftStore, useEditRequestStore, useLeaveRequestStore, syncDraftToSupabase, getSupabase, fetchSurveyDetail, fetchLeaveRequestsFromSupabase, createLeaveRequestInSupabase } from '@pro-vision-care/shared';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, FileText, UploadCloud, MapPin, CheckCircle2, Clock, Pencil, Send, CheckCheck, XCircle, AlertCircle, ChevronDown, CalendarDays, Calendar, X, Users, Trash2, Award, Upload, Image } from 'lucide-react';


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
  
  const [isCcModalOpen, setIsCcModalOpen] = useState(false);
  const [ccList, setCcList] = useState<any[]>([]);
  const [loadingCc, setLoadingCc] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventFormData, setEventFormData] = useState({
    achieved_participants: '',
    event_date: '',
    place: '',
    start_time: '',
    end_time: '',
    resource_person: '',
    images: [] as string[]
  });
  const [eventUploading, setEventUploading] = useState(false);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const supabase = getSupabase() as any;
      const { data } = await supabase.from('events').select('id, activity, sno').order('sno', { ascending: true });
      if (data) setEventsList(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingEvents(false);
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setEventUploading(true);
    const supabase = getSupabase() as any;
    
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `staff-uploads/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      } catch (err) {
        console.warn("Upload failed:", err);
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
    setEventFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setEventUploading(false);
  };

  const handleSubmitEventReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Please select an event");
      return;
    }
    
    try {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('event_reports').insert([{
        event_id: selectedEventId,
        staff_email: user?.email || '',
        achieved_participants: parseInt(eventFormData.achieved_participants) || 0,
        event_date: eventFormData.event_date || null,
        start_time: eventFormData.start_time,
        end_time: eventFormData.end_time,
        place: eventFormData.place,
        resource_person: eventFormData.resource_person,
        images: eventFormData.images
      }]);
      
      if (error) throw error;
      alert("Event details submitted successfully!");
      setIsEventModalOpen(false);
      setEventFormData({ achieved_participants: '', event_date: '', place: '', start_time: '', end_time: '', resource_person: '', images: [] });
      setSelectedEventId('');
    } catch(err) {
      console.error(err);
      alert("Failed to submit event details");
    }
  };

  const fetchCCs = async () => {
    setLoadingCc(true);
    try {
      const supabase = getSupabase() as any;
      const { data } = await supabase.from('community_collectives').select('*').order('sno', { ascending: true });
      if (data) setCcList(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingCc(false);
  };

  const handleSaveCc = async (cc: any, _index: number) => {
    if (!cc.name.trim()) {
      alert('Please enter a name for the CC Meeting.');
      return;
    }
    
    try {
      const supabase = getSupabase() as any;
      
      if (cc.id) {
        const { error } = await supabase.from('community_collectives').update({
          name: cc.name,
          membership_count: cc.membership_count,
          meetings_conducted: cc.meetings_conducted,
          participants_count: cc.participants_count
        }).eq('id', cc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('community_collectives').insert([{
          name: cc.name,
          membership_count: cc.membership_count || 0,
          meetings_conducted: cc.meetings_conducted || 0,
          participants_count: cc.participants_count || 0,
          sno: String(ccList.length)
        }]);
        if (error) throw error;
      }
      
      alert(`Saved successfully for ${cc.name}`);
      fetchCCs();
    } catch(e) {
      console.error(e);
      alert('Error saving CC Meeting');
    }
  };

  const handleAddNewCc = () => {
    setCcList([...ccList, { name: '', membership_count: 0, meetings_conducted: 0, participants_count: 0 }]);
  };

  const handleDeleteCc = async (cc: any, index: number) => {
    if (!cc.id) {
      // It's a newly added row not yet saved to DB
      const newList = [...ccList];
      newList.splice(index, 1);
      setCcList(newList);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${cc.name}?`)) return;

    try {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('community_collectives').delete().eq('id', cc.id);
      if (error) throw error;
      
      alert(`Deleted successfully.`);
      fetchCCs();
    } catch(e) {
      console.error(e);
      alert('Error deleting CC Meeting');
    }
  };

  // Leave request state
  const { leaveRequests, submitLeaveRequest, setLeaveRequests } = useLeaveRequestStore();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useEffect(() => {
    const loadLeaveRequests = async () => {
      if (!user?.email) return;
      const remoteLeaves = await fetchLeaveRequestsFromSupabase(user.email);
      if (remoteLeaves && remoteLeaves.length > 0) {
        setLeaveRequests(remoteLeaves);
      }
    };
    loadLeaveRequests();
  }, [user?.email]);

  const handleOpenLeaveModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setLeaveType('Casual Leave');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setLeaveReason('');
    setIsLeaveModalOpen(true);
  };

  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      alert("Please provide a reason for the leave request.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    setSubmittingLeave(true);
    try {
      const staffName = user?.user_metadata?.full_name || user?.email?.split('@')[0].toUpperCase() || user?.email || '';
      const localReq = submitLeaveRequest({
        staffEmail: user?.email || '',
        staffName,
        leaveType,
        startDate,
        endDate,
        reason: leaveReason.trim(),
      });

      await createLeaveRequestInSupabase(localReq);

      alert("Leave request submitted successfully to Admin!");
      setIsLeaveModalOpen(false);
    } catch (err: any) {
      console.error("Leave request error:", err);
      alert("Submitted locally. Admin will be notified when synchronized.");
      setIsLeaveModalOpen(false);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const myLeaveRequests = Object.values(leaveRequests)
    .filter(r => r.staffEmail === user?.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attendance states
  const [attendanceStatus, setAttendanceStatus] = useState<'loading' | 'not_checked_in' | 'checked_in' | 'checked_out'>('loading');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.email) return;
      setAttendanceStatus('loading');
      try {
        const supabase = getSupabase() as any;
                
        const { data, error } = await supabase
          .from('staff_attendance')
          .select('*')
          .eq('email', user.email)
          .order('login_time', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const log = data[0];
          setAttendanceId(log.id);
          setCheckInTime(log.login_time);
          if (log.logout_time) {
            setCheckOutTime(log.logout_time);
            setAttendanceStatus('checked_out');
          } else {
            setAttendanceStatus('checked_in');
          }
        } else {
          setAttendanceStatus('not_checked_in');
        }
      } catch (err) {
        console.warn("Failed to fetch attendance from database, using localStorage fallback:", err);
                const localLogs = localStorage.getItem('care_attendance_logs');
        const logs = localLogs ? JSON.parse(localLogs) : [];
        const todayLog = logs.findLast((l: any) => l.email === user.email);
        
        if (todayLog) {
          setCheckInTime(todayLog.loginTime);
          if (todayLog.logoutTime) {
            setCheckOutTime(todayLog.logoutTime);
            setAttendanceStatus('checked_out');
          } else {
            setAttendanceStatus('checked_in');
          }
        } else {
          setAttendanceStatus('not_checked_in');
        }
      }
    };
    fetchAttendance();
  }, [user?.email]);

  const handleCheckIn = async () => {
    if (!user?.email) return;
    const nowISO = new Date().toISOString();
    try {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('staff_attendance')
        .insert([{ email: user.email, login_time: nowISO }])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setAttendanceId(data.id);
      setCheckInTime(data.login_time);
      setAttendanceStatus('checked_in');
    } catch (err) {
      console.warn("DB check-in failed, saving to localStorage:", err);
      const localLogs = localStorage.getItem('care_attendance_logs');
      const logs = localLogs ? JSON.parse(localLogs) : [];
      const newLog = {
        id: 'att-' + Date.now(),
        email: user.email,
        loginTime: nowISO,
        logoutTime: null
      };
      logs.push(newLog);
      localStorage.setItem('care_attendance_logs', JSON.stringify(logs));
      
      setCheckInTime(nowISO);
      setAttendanceStatus('checked_in');
    }
  };

  const handleCheckOut = async () => {
    if (!user?.email) return;
    const nowISO = new Date().toISOString();
    try {
      const supabase = getSupabase() as any;
      if (attendanceId) {
        const { error } = await supabase
          .from('staff_attendance')
          .update({ logout_time: nowISO })
          .eq('id', attendanceId);
          
        if (error) throw error;
      } else {
        const { data } = await supabase
          .from('staff_attendance')
          .select('id')
          .eq('email', user.email)
          .is('logout_time', null)
          .order('login_time', { ascending: false })
          .limit(1);
          
        if (data && data.length > 0) {
          await supabase
            .from('staff_attendance')
            .update({ logout_time: nowISO })
            .eq('id', data[0].id);
        }
      }
      setCheckOutTime(nowISO);
      setAttendanceStatus('checked_out');
    } catch (err) {
      console.warn("DB check-out failed, updating in localStorage:", err);
      const localLogs = localStorage.getItem('care_attendance_logs');
      const logs = localLogs ? JSON.parse(localLogs) : [];
      const logIdx = logs.findLastIndex((l: any) => l.email === user.email && !l.logoutTime);
      
      if (logIdx !== -1) {
        logs[logIdx].logoutTime = nowISO;
        localStorage.setItem('care_attendance_logs', JSON.stringify(logs));
      }
      setCheckOutTime(nowISO);
      setAttendanceStatus('checked_out');
    }
  };

  const staffHamlets = user?.email ? (STAFF_HAMLET_MAP[user.email] ?? []) : [];

  // Auto-initialize hamlet_code if it is not in the user's assigned hamlets list (e.g. placeholder 'HAM-001')
  useEffect(() => {
    if (!user?.email || staffHamlets.length === 0) return;
    if (!hamlet_code || !staffHamlets.includes(hamlet_code)) {
      setHamletCode(staffHamlets[0]);
    }
  }, [user?.email, hamlet_code, staffHamlets, setHamletCode]);

  useEffect(() => {
    const loadSyncedSurveys = async () => {
      if (!user?.email || !hamlet_code) return;
      setLoadingSynced(true);
      try {
        const supabase = getSupabase();
        
        const { data, error } = await supabase
          .from('households')
          .select('id, household_number, hamlet_code, staff_name, date, created_at')
          .eq('hamlet_code', hamlet_code);

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
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
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
                        onClick={() => {
                          setHamletCode(code);
                          setHamletOpen(false);
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

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setIsEventModalOpen(true);
                  fetchEvents();
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px 20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(16,185,129,0.4)',
                  transition: 'all 220ms ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.55)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(16,185,129,0.4)'; }}
              >
                <Award size={18} />
                <span>Add Event Details</span>
              </button>
              <button
                onClick={() => {
                  setIsCcModalOpen(true);
                fetchCCs();
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 20px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(245,158,11,0.4)',
                transition: 'all 220ms ease',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(245,158,11,0.4)'; }}
            >
              <Users size={18} />
              Update CC
            </button>
            <button
              id="staff-request-leave"
              onClick={handleOpenLeaveModal}
              style={{
                background: 'linear-gradient(135deg, #1B3A5C, #2c527e)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 20px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(27,58,92,0.4)',
                transition: 'all 220ms ease',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,58,92,0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(27,58,92,0.4)'; }}
            >
              <CalendarDays size={18} />
              Request Leave
            </button>

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
        </div>

        {/* Daily Attendance Card */}
        <div
          className="animate-fade-in-up"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            animation: 'fadeInUp 200ms ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: attendanceStatus === 'checked_in' ? 'rgba(16,185,129,0.1)' : attendanceStatus === 'checked_out' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: attendanceStatus === 'checked_in' ? '#10b981' : attendanceStatus === 'checked_out' ? '#ef4444' : '#f59e0b',
                flexShrink: 0
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Daily Attendance Log</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
                {attendanceStatus === 'loading' && 'Checking status...'}
                {attendanceStatus === 'not_checked_in' && 'You have not checked in for duty today.'}
                {attendanceStatus === 'checked_in' && `Checked in at ${new Date(checkInTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                {attendanceStatus === 'checked_out' && `Completed shift (Checked out at ${new Date(checkOutTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {(attendanceStatus === 'not_checked_in' || attendanceStatus === 'checked_out') && (
              <button
                onClick={handleCheckIn}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                  transition: 'all 150ms'
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'none')}
              >
                {attendanceStatus === 'checked_out' ? 'Check In Again' : 'Check In'}
              </button>
            )}
            {attendanceStatus === 'checked_in' && (
              <button
                onClick={handleCheckOut}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                  transition: 'all 150ms'
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'none')}
              >
                Check Out
              </button>
            )}
            {attendanceStatus === 'checked_out' && (
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                Shift Ended
              </span>
            )}
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

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

        {/* My Leave Requests Section */}
        <div className="chart-card animate-fade-in-up" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <CalendarDays size={18} color="#1B3A5C" style={{ flexShrink: 0 }} />
              My Leave Requests
              <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', marginLeft: '6px' }}>
                {myLeaveRequests.length}
              </span>
            </h2>
            <button
              onClick={handleOpenLeaveModal}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg,#1B3A5C,#2c527e)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,58,92,0.25)' }}
            >
              <PlusCircle size={14} /> Apply Leave
            </button>
          </div>

          {myLeaveRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <Calendar size={38} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No leave requests submitted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {myLeaveRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                        {req.leaveType}
                      </span>
                      {req.status === 'pending' && (
                        <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCheck size={12} /> Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Declined
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      <span>{req.startDate} to {req.endDate}</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontStyle: 'italic' }}>
                      "{req.reason}"
                    </p>
                  </div>

                  {req.adminNote && (
                    <div style={{ background: req.status === 'approved' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${req.status === 'approved' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', padding: '8px 10px', fontSize: '0.75rem', color: req.status === 'approved' ? '#166534' : '#991b1b' }}>
                      <strong>Admin Note:</strong> {req.adminNote}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right' }}>
                    Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Leave Request Modal */}
      {isLeaveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Request Leave</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Submit leave application with reason for Admin review</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitLeaveRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc' }}
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Earned Leave">Earned / Annual Leave</option>
                  <option value="Special Leave">Special / Maternity Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason for Leave <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the detailed reason for your leave request..."
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#2A9D8F,#1B3A5C)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: submittingLeave ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(42,157,143,0.4)', opacity: submittingLeave ? 0.7 : 1 }}
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
        {/* Events Modal */}
        {isEventModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Add Event Details</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Submit event details for assigned activities</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitEventReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select Event</label>
                  <select 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Event --</option>
                    {eventsList.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.sno} - {ev.activity}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Number of Participants</label>
                    <input type="number" required value={eventFormData.achieved_participants} onChange={e => setEventFormData({...eventFormData, achieved_participants: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Event Date</label>
                    <input type="date" required value={eventFormData.event_date} onChange={e => setEventFormData({...eventFormData, event_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Start Time</label>
                    <input type="time" required value={eventFormData.start_time} onChange={e => setEventFormData({...eventFormData, start_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>End Time</label>
                    <input type="time" required value={eventFormData.end_time} onChange={e => setEventFormData({...eventFormData, end_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Place</label>
                  <input type="text" required value={eventFormData.place} onChange={e => setEventFormData({...eventFormData, place: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="E.g. Community Hall" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Resource Person</label>
                  <input type="text" required value={eventFormData.resource_person} onChange={e => setEventFormData({...eventFormData, resource_person: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="E.g. Dr. John Doe" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Add Images</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Upload size={16} /> Upload Image
                      <input type="file" multiple accept="image/*" onChange={handleEventImageUpload} style={{ display: 'none' }} />
                    </label>
                    {eventUploading && <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Uploading...</span>}
                  </div>
                  {eventFormData.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {eventFormData.images.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt="upload" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          <button
                            type="button"
                            onClick={() => setEventFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsEventModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>Submit Details</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CC Meetings Modal */}
      {isCcModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '700px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Update CC Meetings</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Edit meetings conducted and participants count</p>
                </div>
              </div>
              <button
                onClick={() => setIsCcModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {loadingCc ? (
                <p style={{ textAlign: 'center', color: '#64748b', margin: '20px 0' }}>Loading CC meetings...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ccList.map((cc, i) => (
                    <div key={cc.id || `new-${i}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CC Name</label>
                        <input 
                          type="text" 
                          placeholder="Meeting Name"
                          value={cc.name} 
                          onChange={e => {
                            const newList = [...ccList];
                            newList[i].name = e.target.value;
                            setCcList(newList);
                          }} 
                          style={{ width: '100%', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meetings</label>
                        <input 
                          type="number" 
                          value={cc.meetings_conducted} 
                          onChange={e => {
                            const newList = [...ccList];
                            newList[i].meetings_conducted = Number(e.target.value);
                            setCcList(newList);
                          }} 
                          style={{ width: '80px', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Participants</label>
                        <input 
                          type="number" 
                          value={cc.participants_count} 
                          onChange={e => {
                            const newList = [...ccList];
                            newList[i].participants_count = Number(e.target.value);
                            setCcList(newList);
                          }} 
                          style={{ width: '80px', padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-end' }}>
                        <button 
                          onClick={() => handleSaveCc(cc, i)} 
                          style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#2A9D8F,#1e8779)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(42,157,143,0.3)' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => handleDeleteCc(cc, i)} 
                          style={{ padding: '8px 12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddNewCc}
                    style={{
                      background: 'rgba(42,157,143,0.1)',
                      color: '#2A9D8F',
                      border: '1px dashed #2A9D8F',
                      borderRadius: '10px',
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    <PlusCircle size={18} />
                    Add New CC Meeting
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCcModalOpen(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

