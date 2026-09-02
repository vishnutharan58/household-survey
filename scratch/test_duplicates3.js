const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://looezwqzqumajqlavgvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2V6d3F6cXVtYWpxbGF2Z3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTc1MjQsImV4cCI6MjA5NzY3MzUyNH0.pFRZt5C_5OmJq_X99w6uLY6mYCrJeR79WjfdbSjIxFk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: staffList } = await supabase.from('staff_details').select('*');
  const { data: staffUsersList } = await supabase.from('staff_users').select('*');
  const { data: attendanceList } = await supabase.from('staff_attendance').select('*');

  const m = new Date().getMonth();
  const y = new Date().getFullYear();

  const staffMap = new Map();
  staffList.forEach(s => staffMap.set((s.email || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, logs: {} }));
  
  staffUsersList.forEach(s => {
    if (!s.email) return;
    const sEmail = s.email.toLowerCase();
    if (staffMap.has(sEmail)) return;
    
    const sName = (s.name || '').toLowerCase();
    const entry = Array.from(staffMap.entries()).find(([k, v]) => {
        const vName = (v.name || '').toLowerCase();
        return vName && sName && (vName === sName || vName.includes(sName) || sName.includes(vName));
    });
    
    if (entry) {
        staffMap.set(sEmail, entry[1]); // Point to same object
    } else {
        staffMap.set(sEmail, { sno: staffMap.size + 1, name: s.name, email: s.email, logs: {} });
    }
  });

  attendanceList.forEach(log => {
    if (!log.email && !log.staff_name) return;
    
    let keyFound = null;
    if (log.email && staffMap.has(log.email.toLowerCase())) {
      keyFound = log.email.toLowerCase();
    } else if (log.staff_name) {
      const nameLower = log.staff_name.toLowerCase();
      const entry = Array.from(staffMap.entries()).find(([k, v]) => v.name.toLowerCase() === nameLower || v.name.toLowerCase().includes(nameLower) || nameLower.includes(v.name.toLowerCase()));
      if (entry) keyFound = entry[0];
    }
    
    const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());
    
    if (!staffMap.has(finalKey)) {
      staffMap.set(finalKey, { sno: staffMap.size + 1, name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), email: log.email || '', logs: {} });
    }
    const date = new Date(log.login_time || log.loginTime);
    if (date.getMonth() === m && date.getFullYear() === y) {
      const d = date.getDate();
      staffMap.get(finalKey).logs[d] = true;
    }
  });

  const tableStaff = Array.from(new Set(staffMap.values())).sort((a, b) => a.sno - b.sno);
  console.log("Total unique staff entries:", tableStaff.length);
  tableStaff.forEach(s => console.log(s.name, Object.keys(s.logs).length, 'logs'));
}
test();
