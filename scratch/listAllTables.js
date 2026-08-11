const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Let's call supabase.rpc or query households to see if we can get list of tables.
  // Actually, we can check the households and members schema by fetching a single row from each.
  // We can also query pg_catalog if we had direct DB access, but through PostgREST we can inspect the schema.
  // Let's try fetching a schema query or querying the 'households' table.
  const { data, error } = await supabase.from('households').select('*').limit(1);
  if (error) {
    console.error("Households fetch error:", error);
  } else {
    console.log("Households sample:", data);
  }
  
  const { data: evData, error: evErr } = await supabase.from('events').select('*').limit(1);
  if (evErr) {
    console.error("Events fetch error:", evErr);
  } else {
    console.log("Events sample:", evData);
  }
}

check();
