const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHolidays() {
  const { data, error } = await supabase.from('holidays').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Holidays table exists. Data:', data);
  }
}
checkHolidays();
