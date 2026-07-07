const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });
  if (authErr) {
    console.error('Auth error:', authErr.message);
    return;
  }
  console.log('Auth success!');

  const userEmail = 'suganya@staff.com';
  const staffPrefix = userEmail.split('@')[0];
  const staffNameCapitalized = staffPrefix.charAt(0).toUpperCase() + staffPrefix.slice(1);
  const hamlet_code = '1.1';

  console.log('Running query with staff prefix:', staffPrefix, 'capitalized:', staffNameCapitalized);

  const { data, error } = await supabase
    .from('households')
    .select('id, household_number, hamlet_code, staff_name, date, created_at')
    .eq('hamlet_code', hamlet_code)
    .or(`staff_name.eq."${userEmail}",staff_name.eq."${staffNameCapitalized}",staff_name.eq."${staffPrefix}"`);

  if (error) {
    console.error('Query error:', error.message, error.details, error.hint);
  } else {
    console.log('Result data length:', data.length);
    console.log('Sample data:', data.slice(0, 2));
  }
}

test();
