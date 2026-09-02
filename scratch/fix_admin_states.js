const fs = require('fs');

let content = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const targetContentStart = `  const [attendanceList, setAttendanceList] = useState<any[]>([]);`;
const targetContentEnd = `  const [servicesList, setServicesList] = useState<any[]>([]);`;

const startIndex = content.indexOf(targetContentStart);
const endIndex = content.indexOf(targetContentEnd) + targetContentEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find target block');
  process.exit(1);
}

const replacement = `  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [staffUsersList, setStaffUsersList] = useState<any[]>([]);
  const [attendanceTimeFilter, setAttendanceTimeFilter] = useState<'daily'|'weekly'|'monthly'|'yearly'>('daily');
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState<string>('all');
  const [servicesList, setServicesList] = useState<any[]>([]);`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', newContent);
console.log('States added');
