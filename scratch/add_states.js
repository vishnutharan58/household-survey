const fs = require('fs');

let content = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. Add states
const stateOld = `  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);`;
const stateNew = `  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [staffUsersList, setStaffUsersList] = useState<any[]>([]);
  const [attendanceTimeFilter, setAttendanceTimeFilter] = useState<'daily'|'weekly'|'monthly'|'yearly'>('daily');
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState<string>('all');
  const [servicesList, setServicesList] = useState<any[]>([]);`;
content = content.replace(stateOld, stateNew);

// 2. Load DB
const loadOld = `      const { data: dbSchemes } = await supabase.from('schemes_list').select('*').order('sno', { ascending: true });
      const { data: dbAttendance } = await supabase.from('staff_attendance').select('*').order('login_time', { ascending: false });
      const { data: dbServices } = await supabase.from('other_services_list').select('*').order('sno', { ascending: true });`;
const loadNew = `      const { data: dbSchemes } = await supabase.from('schemes_list').select('*').order('sno', { ascending: true });
      const { data: dbAttendance } = await supabase.from('staff_attendance').select('*').order('login_time', { ascending: false });
      const { data: dbStaffUsers } = await supabase.from('staff_users').select('*');
      const { data: dbServices } = await supabase.from('other_services_list').select('*').order('sno', { ascending: true });`;
content = content.replace(loadOld, loadNew);

// 3. Set state
const setOld = `      setServicesList(combinedServices);
      localStorage.setItem('care_portal_other_services', JSON.stringify(combinedServices));
      setAttendanceList(dbAttendance || []);
      
      if (dbSeaMembers && dbSeaMembers.length > 0) {`;
const setNew = `      setServicesList(combinedServices);
      localStorage.setItem('care_portal_other_services', JSON.stringify(combinedServices));
      setAttendanceList(dbAttendance || []);
      setStaffUsersList(dbStaffUsers || []);
      localStorage.setItem('care_staff_users', JSON.stringify(dbStaffUsers || []));
      
      if (dbSeaMembers && dbSeaMembers.length > 0) {`;
content = content.replace(setOld, setNew);

// 4. Local fallback
const fallbackOld = `      const localAttendance = localStorage.getItem('care_attendance_logs');
      setAttendanceList(localAttendance ? JSON.parse(localAttendance) : []);

      const localSeaMembers = localStorage.getItem('care_sea_members');`;
const fallbackNew = `      const localAttendance = localStorage.getItem('care_attendance_logs');
      setAttendanceList(localAttendance ? JSON.parse(localAttendance) : []);

      const localStaffUsers = localStorage.getItem('care_staff_users');
      setStaffUsersList(localStaffUsers ? JSON.parse(localStaffUsers) : []);

      const localSeaMembers = localStorage.getItem('care_sea_members');`;
content = content.replace(fallbackOld, fallbackNew);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', content);
console.log('States added');
