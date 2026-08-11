require('dotenv').config({ path: 'apps/web/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@provision.com',
    admin123: 'password' // Assuming this is correct from earlier scripts
  });

  if (error) {
    console.error("Login failed", error);
    return;
  }

  const tables = ['households', 'members', 'documents', 'care_documents', 'corrections_required', 'care_corrections', 'corrections_made', 'care_corrections_made', 'new_documents_needed', 'care_new_members', 'base_documents_available', 'care_base_members', 'schemes_accessed', 'care_schemes'];

  for (const table of tables) {
    const res = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (res.error) {
      console.log(`Table ${table} error: ${res.error.message}`);
    } else {
      console.log(`Table ${table}: ${res.count} rows`);
    }
  }
}
run();
