const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function count() {
  try {
    // Count households
    const { count: hhCount, error: hhErr } = await supabase
      .from('households')
      .select('*', { count: 'exact', head: true });
    
    if (hhErr) throw hhErr;

    // Count members
    const { count: memCount, error: memErr } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    if (memErr) throw memErr;

    console.log(`=== DATABASE COUNTS ===`);
    console.log(`Households: ${hhCount}`);
    console.log(`Individuals (Members): ${memCount}`);
  } catch (err) {
    console.error("Count failed:", err.message);
  }
}

count();
