const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Logging in as suganya@staff.com...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'suganya@staff.com',
    password: 'suganya123'
  });

  if (authErr) {
    console.error('Auth error:', authErr.message);
    return;
  }

  const user = authData.user;
  const hamlet_code = user.user_metadata?.hamlet_code;
  console.log('Auth success!');
  console.log('User metadata hamlet_code:', hamlet_code);

  const staffPrefix = user.email.split('@')[0];
  const staffNameCapitalized = staffPrefix.charAt(0).toUpperCase() + staffPrefix.slice(1);

  console.log('Querying households for hamlet:', hamlet_code, 'and staff name/email variants...');

  const { data, error } = await supabase
    .from('households')
    .select('id, household_number, hamlet_code, staff_name, date, created_at')
    .eq('hamlet_code', hamlet_code)
    .or(`staff_name.eq."${user.email}",staff_name.eq."${staffNameCapitalized}",staff_name.eq."${staffPrefix}"`);

  if (error) {
    console.error('Query error:', error.message, error.details, error.hint);
  } else {
    console.log('Query succeeded!');
    console.log('Households returned count:', data.length);
    if (data.length > 0) {
      console.log('Sample household:', data[0]);
    }
  }
}

test();
