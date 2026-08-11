const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  // Let's sign in as suganya@staff.com
  const { data, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'suganya@staff.com',
    password: 'staffpassword' // Let's see if this password works
  });

  if (authErr) {
    console.error('Login failed:', authErr.message);
    return;
  }

  console.log('Logged in as Suganya. Initial metadata hamlet_code:', data.user.user_metadata?.hamlet_code);

  // Let's try to query households
  const { data: hhs1, error: err1 } = await supabase
    .from('households')
    .select('household_number, hamlet_code')
    .limit(5);

  if (err1) {
    console.error('Error fetching initially:', err1.message);
  } else {
    console.log('Initially fetched:', hhs1);
  }

  // Let's update user metadata to '1.2'
  console.log('Updating hamlet_code to 1.2...');
  const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
    data: { hamlet_code: '1.2' }
  });

  if (updateErr) {
    console.error('Failed to update:', updateErr.message);
    return;
  }

  console.log('Updated user metadata hamlet_code:', updateData.user.user_metadata?.hamlet_code);

  // Query households again
  const { data: hhs2, error: err2 } = await supabase
    .from('households')
    .select('household_number, hamlet_code')
    .limit(5);

  if (err2) {
    console.error('Error fetching after update:', err2.message);
  } else {
    console.log('Fetched after update:', hhs2);
  }
}

test();
