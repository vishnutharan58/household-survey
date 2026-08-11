const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function restoreEvents() {
  const updates = [
    { sno: '1.3', achieved_programs: 13, achieved_participants: 0 },
    { sno: '5.1', achieved_programs: 2, achieved_participants: 0 },
    { sno: '5.3', achieved_programs: 25, achieved_participants: 0 },
    { sno: '1.1', achieved_programs: 1, achieved_participants: 6528 }
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('events')
      .update({ achieved_programs: update.achieved_programs, achieved_participants: update.achieved_participants })
      .eq('sno', update.sno);
      
    if (error) {
      console.error(`Failed to update event ${update.sno}:`, error);
    } else {
      console.log(`Restored Event ${update.sno}`);
    }
  }
}

restoreEvents();
