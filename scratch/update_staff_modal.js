const fs = require('fs');

let content = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. Update EditStaffModal signature and state
let modalStart = `function EditStaffModal({ staff, onClose, onSave }: EditStaffModalProps) {`;
let modalStartRepl = `function EditStaffModal({ staff, onClose, onSave }: EditStaffModalProps) {
  const [password, setPassword] = useState('');`;

content = content.replace(modalStart, modalStartRepl);

// 2. Update EditStaffModal handleFormSubmit
let submitOld = `    onSave({
      ...staff,
      sno: parseInt(sno, 10) || Math.floor(Math.random() * 100) + 10,
      name,
      bloodGroup,
      qualification,
      phone,
      designation,
      joiningDate,
      workExperience,
      email
    });`;
let submitNew = `    onSave({
      ...staff,
      sno: parseInt(sno, 10) || Math.floor(Math.random() * 100) + 10,
      name,
      bloodGroup,
      qualification,
      phone,
      designation,
      joiningDate,
      workExperience,
      email
    }, password);`;
content = content.replace(submitOld, submitNew);

// 3. Update EditStaffModal UI to show Password field if new
let emailFieldOld = `            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input type="email" placeholder="e.g. regin@gmail.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} required />
            </div>`;
let emailFieldNew = `            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input type="email" placeholder="e.g. regin@gmail.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} required />
            </div>
            {!staff && (
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Password</label>
                <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.86rem' }} required />
              </div>
            )}`;
content = content.replace(emailFieldOld, emailFieldNew);

// 4. Update handleSaveStaff
let handleSaveStaffOld = `  // CRUD actions for Staff
  const handleSaveStaff = async (staffData: any) => {`;
let handleSaveStaffNew = `  // CRUD actions for Staff
  const handleSaveStaff = async (staffData: any, password?: string) => {`;
content = content.replace(handleSaveStaffOld, handleSaveStaffNew);

// 5. Update handleSaveStaff insert logic
let insertOld = `        if (isNew) {
          const { error } = await supabase.from('staff_details').insert([dbObj]);
          if (error) throw error;
        }`;
let insertNew = `        if (isNew) {
          if (password) {
             // Create User in Auth using secondary client to not log out Admin
             const { createClient } = await import('@supabase/supabase-js');
             const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
             const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
             const secClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
             const { error: authError } = await secClient.auth.signUp({
               email: preparedData.email,
               password: password,
               options: {
                 data: { role: 'staff' }
               }
             });
             if (authError) {
               console.error("Auth creation error:", authError);
               alert("Failed to create user login: " + authError.message);
               throw authError;
             }
             
             // Insert into staff_users
             await supabase.from('staff_users').insert([{ email: preparedData.email, name: preparedData.name }]);
          }
          const { error } = await supabase.from('staff_details').insert([dbObj]);
          if (error) throw error;
        }`;
content = content.replace(insertOld, insertNew);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', content);
console.log('Update staff modal applied!');
