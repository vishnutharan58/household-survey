const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncEvents() {
  console.log('Fetching all events...');
  const { data: events, error: eventsErr } = await supabase.from('events').select('*');
  
  if (eventsErr) {
    console.error('Error fetching events:', eventsErr);
    return;
  }
  
  console.log(`Found ${events.length} events. Fetching all event reports...`);
  const { data: reports, error: reportsErr } = await supabase.from('event_reports').select('*');
  
  if (reportsErr) {
    console.error('Error fetching reports:', reportsErr);
    return;
  }
  
  console.log(`Found ${reports.length} reports. Aggregating...`);
  
  for (const event of events) {
    const eventReports = reports.filter(r => r.event_id === event.id);
    const achieved_programs = eventReports.length;
    const achieved_participants = eventReports.reduce((sum, r) => sum + (r.achieved_participants || 0), 0);
    
    if (event.achieved_programs !== achieved_programs || event.achieved_participants !== achieved_participants) {
      console.log(`Updating Event ${event.sno}: Programs ${event.achieved_programs} -> ${achieved_programs}, Participants ${event.achieved_participants} -> ${achieved_participants}`);
      
      const { error: updateErr } = await supabase
        .from('events')
        .update({ achieved_programs, achieved_participants })
        .eq('id', event.id);
        
      if (updateErr) {
        console.error(`Failed to update event ${event.id}:`, updateErr);
      }
    }
  }
  
  console.log('Sync complete.');
}

syncEvents();
