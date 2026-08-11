const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const passwords = [
  'staffpassword',
  'staff123',
  'staff1234',
  'suganya',
  'suganya123',
  'suganya@123',
  'provision123',
  'provision',
  'admin123',
  '12345678',
  '123456',
  'password'
];

async function test() {
  for (const pw of passwords) {
    console.log(`Trying password: "${pw}"...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'suganya@staff.com',
      password: pw
    });
    if (!error) {
      console.log(`Success! Password is: "${pw}"`);
      console.log('User metadata:', data.user.user_metadata);
      return;
    } else {
      console.log(`Failed: ${error.message}`);
    }
  }
  console.log('None of the common passwords worked.');
}

test();
