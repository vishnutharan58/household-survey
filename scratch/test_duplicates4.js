const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://looezwqzqumajqlavgvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2V6d3F6cXVtYWpxbGF2Z3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTc1MjQsImV4cCI6MjA5NzY3MzUyNH0.pFRZt5C_5OmJq_X99w6uLY6mYCrJeR79WjfdbSjIxFk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: staffList } = await supabase.from('staff_details').select('*');
  const { data: staffUsersList } = await supabase.from('staff_users').select('*');
  const { data: attendanceList } = await supabase.from('staff_attendance').select('*');

  const m = 7; // August is month 7 in JS (0-indexed)
  const y = 2026;

  const staffMap = new Map();
  staffList.forEach(s => staffMap.set((s.email || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, logs: {} }));
  
  staffUsersList.forEach(s => {
    if (s.email && !staffMap.has(s.email.toLowerCase())) {
      staffMap.set(s.email.toLowerCase(), { sno: staffMap.size + 1, name: s.name, email: s.email, logs: {} });
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
        // Match if auth email prefix is part of the staff's name (e.g. 'suganya' in 'SUGANYA D')
        if (logNamePrefix && vName.includes(logNamePrefix)) return true;
        // Or if staff_name was provided and matches
        if (sName && (vName === sName || vName.includes(sName) || sName.includes(vName))) return true;
        return false;
      });
      if (entry) keyFound = entry[0];
    }
    
    const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();
    
    if (!staffMap.has(finalKey)) {
      staffMap.set(finalKey, { sno: staffMap.size + 1, name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), email: log.email || '', logs: {} });
    }
    const date = new Date(log.login_time || log.loginTime);
    if (date.getMonth() === m && date.getFullYear() === y) {
      const d = date.getDate();
      staffMap.get(finalKey).logs[d] = true;
    }
  });

  const tableStaff = Array.from(staffMap.values()).sort((a, b) => a.sno - b.sno);
  console.log("Total unique staff entries:", tableStaff.length);
  tableStaff.forEach(s => console.log(s.name, Object.keys(s.logs).length, 'logs'));
}
test();
