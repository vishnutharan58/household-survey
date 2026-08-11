const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Signing up suganya@staff.com...');
  const { data, error } = await supabase.auth.signUp({
    email: 'suganya@staff.com',
    password: 'staffpassword',
    options: {
      data: {
        role: 'staff',
        hamlet_code: '1.1'
      }
    }
  });

  if (error) {
    console.error('Sign up failed:', error.message);
  } else {
    console.log('Sign up result:', data);
  }
}

test();
