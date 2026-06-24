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

  // Test households with member count query
  const { data, error } = await supabase
    .from('households')
    .select('id, household_number, hamlet_code, staff_name, date, economic_status, members(count)')
    .limit(5);

  if (error) {
    console.error('Query error:', error.message);
  } else {
    console.log('Result data:', JSON.stringify(data, null, 2));
  }
}

test();
