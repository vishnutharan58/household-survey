const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const tables = ['events', 'staff_details', 'community_collectives', 'documents_list', 'schemes_list', 'staff_attendance', 'other_services_list', 'sea_members_list'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(t, "FAILED:", error.message);
    } else {
      console.log(t, "EXISTS");
    }
  }
}
test();
