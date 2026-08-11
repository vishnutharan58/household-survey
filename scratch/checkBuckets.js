const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  console.log('Logging in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log('Error listing buckets:', error.message);
  } else {
    console.log('Buckets:', buckets);
  }
}

main().catch(console.error);
