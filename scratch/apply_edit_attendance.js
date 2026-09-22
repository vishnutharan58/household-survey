const fs = require('fs');

const path = 'd:\\HOUSEHOLDSURVEY\\apps\\web\\src\\pages\\Admin\\AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace handleSaveAttendance
const handleSaveStr = `const handleSaveAttendance = async (_data: any) => { setEditingAttendance(null); };`;
const newHandleSaveStr = `const handleSaveAttendance = async (data: any) => { 
    setLoading(true);
    const selDate = new Date(attendanceSelectedDate);
    const dateStr = \`\${selDate.getFullYear()}-\${(selDate.getMonth()+1).toString().padStart(2, '0')}-\${selDate.getDate().toString().padStart(2, '0')}\`;

    try {
      if (data.status === 'Absent') {
        const { error } = await supabase
          .from('staff_attendance')
          .delete()
          .eq('email', data.email)
          .gte('login_time', \`\${dateStr}T00:00:00\`)
          .lte('login_time', \`\${dateStr}T23:59:59\`);
        if (error) throw error;
      } else {
        const inTimeStr = data.in || '09:00';
        const loginTime = \`\${dateStr}T\${inTimeStr}:00+05:30\`;
        const logoutTime = data.out ? \`\${dateStr}T\${data.out}:00+05:30\` : null;

        const { data: existing } = await supabase
          .from('staff_attendance')
          .select('id')
          .eq('email', data.email)
          .gte('login_time', \`\${dateStr}T00:00:00\`)
          .lte('login_time', \`\${dateStr}T23:59:59\`)
          .limit(1);

        if (existing && existing.length > 0) {
          const { error } = await supabase
            .from('staff_attendance')
            .update({ login_time: loginTime, logout_time: logoutTime })
            .eq('id', existing[0].id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('staff_attendance')
            .insert({ email: data.email, login_time: loginTime, logout_time: logoutTime });
          if (error) throw error;
        }
      }
      const { data: dbAttendance } = await supabase.from('staff_attendance').select('*').order('login_time', { ascending: false });
      if (dbAttendance) setAttendanceList(dbAttendance);
    } catch (err: any) {
      console.error(err);
      alert('Error updating attendance: ' + err.message);
    } finally {
      setLoading(false);
      setEditingAttendance(null);
    }
  };`;
content = content.replace(handleSaveStr, newHandleSaveStr);

// Replace EditAttendanceModal
const modalStart = `function EditAttendanceModal({ attendance, onClose, onSave }: { attendance: any, onClose: () => void, onSave: (data: any) => void }) {`;
const modalEnd = `  );
}`;
const startIndex = content.indexOf(modalStart);
const endIndex = content.indexOf(modalEnd, startIndex) + modalEnd.length;

const newModalStr = `function EditAttendanceModal({ attendance, onClose, onSave }: { attendance: any, onClose: () => void, onSave: (data: any) => void }) {
  // Convert standard time like "09:00 AM" or "09:00" to "HH:mm" if needed, 
  // but it seems they are already "HH:mm" from toLocaleTimeString or we can just let user type.
  // Actually, type="time" expects "HH:mm". Let's convert to 24hr format if it has AM/PM
  const parseTime = (t: string) => {
    if (!t) return '';
    if (t.includes('AM') || t.includes('PM')) {
      const match = t.match(/(\\d+):(\\d+)\\s?(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return \`\${h.toString().padStart(2, '0')}:\${m}\`;
      }
    }
    return t.substring(0, 5);
  };
  
  const [inTime, setInTime] = useState(parseTime(attendance.in) || '');
  const [outTime, setOutTime] = useState(parseTime(attendance.out) || '');
  const [status, setStatus] = useState<'Present' | 'Absent'>(attendance.in ? 'Present' : 'Absent');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', color: '#1B3A5C', fontWeight: 800 }}>Edit Attendance ({attendance.name})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Status</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input type="radio" checked={status === 'Present'} onChange={() => setStatus('Present')} style={{ accentColor: '#1B3A5C' }} /> Present
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input type="radio" checked={status === 'Absent'} onChange={() => setStatus('Absent')} style={{ accentColor: '#1B3A5C' }} /> Absent
              </label>
            </div>
          </div>
          {status === 'Present' && (
            <>
              <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>In Time</label><input type="time" value={inTime} onChange={e => setInTime(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Out Time</label><input type="time" value={outTime} onChange={e => setOutTime(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} /></div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ ...attendance, in: inTime, out: outTime, status })} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1B3A5C', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  );
}`;

content = content.substring(0, startIndex) + newModalStr + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log("AdminDashboard.tsx successfully updated!");
