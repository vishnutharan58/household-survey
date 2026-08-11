const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('staff_attendance').select('*').order('login_time', { ascending: false }).limit(5);
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
