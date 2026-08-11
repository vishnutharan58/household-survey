const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  console.log('Connecting to:', url);
  const supabase = createClient(url, key);

  // Check if events table exists by attempting a select
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.log('Error querying "events":', error.message);
  } else {
    console.log('Success querying "events". Table exists. Data:', data);
  }

  // Also check if care_events table exists
  const { data: data2, error: error2 } = await supabase.from('care_events').select('*').limit(1);
  if (error2) {
    console.log('Error querying "care_events":', error2.message);
  } else {
    console.log('Success querying "care_events". Table exists. Data:', data2);
  }
}

main().catch(console.error);
