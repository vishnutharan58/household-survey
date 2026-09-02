const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps/web/src/pages/Admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables
const stateVars = `
  const [attendanceFromDate, setAttendanceFromDate] = useState<string>('');
  const [attendanceToDate, setAttendanceToDate] = useState<string>('');
  const [attendanceMonth, setAttendanceMonth] = useState<string>(String(new Date().getMonth()));
  const [attendanceYear, setAttendanceYear] = useState<string>(String(new Date().getFullYear()));
`;
content = content.replace(
  /const \[attendanceTimeFilter, setAttendanceTimeFilter\] = useState<[^>]+>\('daily'\);/,
  `$&${stateVars}`
);

// 2. Add UI controls
const uiControls = `
                      {attendanceTimeFilter === 'weekly' && (
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                          <input type="date" value={attendanceFromDate} onChange={e => setAttendanceFromDate(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          <span style={{ fontSize: '0.75rem', alignSelf: 'center' }}>to</span>
                          <input type="date" value={attendanceToDate} onChange={e => setAttendanceToDate(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                      )}
                      {attendanceTimeFilter === 'monthly' && (
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                          <select value={attendanceMonth} onChange={e => setAttendanceMonth(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('en', {month:'short'})}</option>)}
                          </select>
                          <select value={attendanceYear} onChange={e => setAttendanceYear(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      )}
                      {attendanceTimeFilter === 'yearly' && (
                        <div style={{ marginLeft: '12px' }}>
                          <select value={attendanceYear} onChange={e => setAttendanceYear(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      )}
`;
content = content.replace(
  /(\{\['daily', 'weekly', 'monthly', 'yearly'\]\.map[\s\S]*?<\/button>\s*\)\)}\s*<\/div>)/,
  `$1${uiControls}`
);

// 3. Update filtering logic
const filterLogicRegex = /if \(attendanceTimeFilter === 'daily'\) \{[\s\S]*?return logDate\.getFullYear\(\) === now\.getFullYear\(\);\s*\}/;
const newFilterLogic = `if (attendanceTimeFilter === 'daily') {
                        return logDate.toDateString() === now.toDateString();
                      } else if (attendanceTimeFilter === 'weekly') {
                        if (attendanceFromDate && attendanceToDate) {
                          const from = new Date(attendanceFromDate);
                          const to = new Date(attendanceToDate);
                          to.setHours(23, 59, 59, 999);
                          return logDate >= from && logDate <= to;
                        }
                        const diff = now.getTime() - logDate.getTime();
                        return diff <= 7 * 24 * 60 * 60 * 1000;
                      } else if (attendanceTimeFilter === 'monthly') {
                        if (attendanceMonth) {
                          return logDate.getMonth() === parseInt(attendanceMonth) && (attendanceYear ? logDate.getFullYear() === parseInt(attendanceYear) : logDate.getFullYear() === now.getFullYear());
                        }
                        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
                      } else if (attendanceTimeFilter === 'yearly') {
                        if (attendanceYear) {
                          return logDate.getFullYear() === parseInt(attendanceYear);
                        }
                        return logDate.getFullYear() === now.getFullYear();
                      }`;

if(content.match(filterLogicRegex)) {
    content = content.replace(filterLogicRegex, newFilterLogic);
} else {
    console.error("Could not find filter logic to replace.");
}

fs.writeFileSync(filePath, content);
console.log('Updated AdminDashboard.tsx attendance UI');
