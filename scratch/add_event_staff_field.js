const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps/web/src/pages/Staff/StaffDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add staffUsersList state and fetch it
if (!content.includes('const [staffUsersList, setStaffUsersList]')) {
  content = content.replace(
    /const \[eventsList, setEventsList\] = useState<any\[\]>\(\[\]\);/,
    `const [eventsList, setEventsList] = useState<any[]>([]);\n  const [staffUsersList, setStaffUsersList] = useState<any[]>([]);`
  );

  content = content.replace(
    /const fetchEvents = async \(\) => \{/,
    `const fetchStaffUsers = async () => {\n    try {\n      const { data, error } = await supabase.from('staff_users').select('*');\n      if (data) setStaffUsersList(data);\n    } catch (err) {}\n  };\n\n  const fetchEvents = async () => {`
  );

  content = content.replace(
    /fetchEvents\(\);/,
    `fetchEvents();\n    fetchStaffUsers();`
  );
}

// 2. Add staff_name to eventFormData
if (!content.includes('staff_name: \'\'')) {
  content = content.replace(
    /const \[eventFormData, setEventFormData\] = useState\(\{[\s\S]*?images: \[\] as string\[\]\n  \}\);/,
    `const [eventFormData, setEventFormData] = useState({
    achieved_participants: '',
    event_date: '',
    start_time: '',
    end_time: '',
    place: '',
    resource_person: '',
    staff_name: '',
    images: [] as string[]
  });`
  );
  
  // Update the reset of eventFormData
  content = content.replace(
    /setEventFormData\(\{ achieved_participants: '', event_date: '', place: '', start_time: '', end_time: '', resource_person: '', images: \[\] \}\);/g,
    `setEventFormData({ achieved_participants: '', event_date: '', place: '', start_time: '', end_time: '', resource_person: '', staff_name: '', images: [] });`
  );
}

// 3. Add staff_name to the database insert
if (!content.includes('staff_name: eventFormData.staff_name')) {
  content = content.replace(
    /resource_person: eventFormData\.resource_person,/,
    `resource_person: eventFormData.resource_person,\n        staff_name: eventFormData.staff_name,`
  );
}

// 4. Add the dropdown UI in the modal
const uiSnippet = `
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Staff Name</label>
                      <select required value={eventFormData.staff_name} onChange={e => setEventFormData({...eventFormData, staff_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                        <option value="">-- Select Staff Member --</option>
                        {staffUsersList.map(staff => (
                          <option key={staff.id} value={staff.name}>{staff.name}</option>
                        ))}
                      </select>
`;

if (!content.includes('Staff Name</label>')) {
  content = content.replace(
    /<input type="text" required value=\{eventFormData\.resource_person\} onChange=\{e => setEventFormData\(\{\.\.\.eventFormData, resource_person: e\.target\.value\}\)\}/,
    `${uiSnippet}\n                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', marginTop: '12px' }}>Resource Person</label>\n                      <input type="text" required value={eventFormData.resource_person} onChange={e => setEventFormData({...eventFormData, resource_person: e.target.value})}`
  );
}

fs.writeFileSync(filePath, content);
console.log('Updated StaffDashboard.tsx event staff name');
