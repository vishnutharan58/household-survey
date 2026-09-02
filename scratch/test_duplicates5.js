const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://looezwqzqumajqlavgvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2V6d3F6cXVtYWpxbGF2Z3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTc1MjQsImV4cCI6MjA5NzY3MzUyNH0.pFRZt5C_5OmJq_X99w6uLY6mYCrJeR79WjfdbSjIxFk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: staffList } = await supabase.from('staff_details').select('*');
  const { data: staffUsersList } = await supabase.from('staff_users').select('*');
  const { data: attendanceList } = await supabase.from('staff_attendance').select('*');

  const attendanceStaffList = staffList.filter(s => !(s.name || '').toLowerCase().includes('regin mary'));

  const staffMap = new Map();
  attendanceStaffList.forEach(s => staffMap.set((s.email || s.name || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, in: null, out: null }));

  staffUsersList.forEach(s => {
    const key = (s.email || s.name || '').toLowerCase();
    if (key && !staffMap.has(key)) {
      staffMap.set(key, { sno: staffMap.size + 1, name: s.name, email: s.email, in: null, out: null });
    }
  });
  
  attendanceList.forEach(log => {
    if (!log.email && !log.staff_name) return;
    
    const logEmail = (log.email || '').toLowerCase();
    const logNamePrefix = logEmail.split('@')[0];
    
    let keyFound = null;
    if (logEmail && staffMap.has(logEmail)) {
      keyFound = logEmail;
    } else {
      const sName = (log.staff_name || '').toLowerCase();
      const entry = Array.from(staffMap.entries()).find(([k, v]) => {
        const vName = (v.name || '').toLowerCase();
        if (logNamePrefix && vName.includes(logNamePrefix)) return true;
        if (sName && (vName === sName || vName.includes(sName) || sName.includes(vName))) return true;
        return false;
      });
      if (entry) keyFound = entry[0];
    }
    
    const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();
    
    if (!staffMap.has(finalKey)) {
      staffMap.set(finalKey, { sno: staffMap.size + 1, name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), email: log.email || '', in: null, out: null });
    }
  });

  const tableStaff = Array.from(staffMap.values()).filter((s) => s.name.toUpperCase().trim() !== 'REGIN MARY').sort((a, b) => a.sno - b.sno);
  console.log("Total unique staff entries:", tableStaff.length);
  tableStaff.forEach(s => console.log(`- ${s.name} (Key: ${s.email || s.name})`));
}
test();
