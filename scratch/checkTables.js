const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const tables = ['staff_members', 'staff_details', 'staff_attendance', 'community_collectives', 'documents_list', 'schemes_list', 'documents', 'events'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table "${t}": Error -> ${error.message} (${error.code})`);
    } else {
      console.log(`Table "${t}": Exists!`);
    }
  }
}

check();
