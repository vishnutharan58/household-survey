const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps/web/src/pages/Admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add eventStaffFilter state to EventDetailModal
if (!content.includes('const [eventStaffFilter, setEventStaffFilter]')) {
  content = content.replace(
    /const \[staffLogs, setStaffLogs\] = useState<any\[\]>\(\[\]\);/,
    `const [staffLogs, setStaffLogs] = useState<any[]>([]);\n  const [eventStaffFilter, setEventStaffFilter] = useState<string>('all');`
  );
}

// 2. Add Filter dropdown
const filterDropdown = `
              {staffLogs.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginRight: '8px' }}>Filter by Staff Name:</label>
                  <select value={eventStaffFilter} onChange={e => setEventStaffFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                    <option value="all">All Staff</option>
                    {Array.from(new Set(staffLogs.map(log => log.staff_name).filter(Boolean))).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
`;

if (!content.includes('Filter by Staff Name:')) {
  content = content.replace(
    /\{staffLogs\.length > 0 \? \(/,
    `${filterDropdown}\n            {staffLogs.length > 0 ? (`
  );
}

// 3. Filter staffLogs based on eventStaffFilter
if (!content.includes('const filteredLogs = staffLogs.filter')) {
  content = content.replace(
    /\{staffLogs\.map\(\(log, i\) => \(/,
    `{(eventStaffFilter === 'all' ? staffLogs : staffLogs.filter(log => log.staff_name === eventStaffFilter)).map((log, i) => (`
  );
}

// 4. Display staff_name in the log entry
if (!content.includes('log.staff_name ||')) {
  content = content.replace(
    /<p style=\{\{ fontSize: '0\.85rem', color: '#1e293b', margin: '2px 0 0', fontWeight: 600 \}\}>\{log\.resource_person \|\| '-'\}/g,
    `<p style={{ fontSize: '0.85rem', color: '#1e293b', margin: '2px 0 0', fontWeight: 600 }}>{log.resource_person || '-'}</p>\n                          </div>\n                          <div style={{ flex: '1 1 200px' }}>\n                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Staff Name</p>\n                            <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: '2px 0 0', fontWeight: 600 }}>{log.staff_name || '-'}</p>`
  );
}

fs.writeFileSync(filePath, content);
console.log('Updated AdminDashboard.tsx Event Report Staff Name');
