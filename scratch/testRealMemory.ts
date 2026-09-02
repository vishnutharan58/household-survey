import { config } from 'dotenv';
config({ path: 'apps/web/.env' });
import { createClient } from '@supabase/supabase-js';
import { fetchAllSurveysForExport } from '../packages/shared/src/syncService';
import { initSupabase } from '../packages/shared/src/supabase';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
(global as any).getSupabase = () => supabase;
initSupabase(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  await supabase.auth.signInWithPassword({ email: 'admin@provision.com', password: 'admin123' });
  const data = await fetchAllSurveysForExport();
  console.log('Households fetched:', data.length);
  
  let memberCount = 0;
  data.forEach(s => {
    s.members?.forEach(m => memberCount++);
  });
  console.log('Members mapped:', memberCount);
}
run();
