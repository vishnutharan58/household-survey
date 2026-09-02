import { config } from 'dotenv';
config({ path: 'apps/web/.env' });
import { createClient } from '@supabase/supabase-js';
import { fetchAllSurveysForExport } from '../packages/shared/src/syncService';
import { generateCareExcel } from '../packages/shared/src/utils/exportToExcel';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
(global as any).getSupabase = () => supabase;

async function run() {
  await supabase.auth.signInWithPassword({ email: 'admin@provision.com', password: 'admin123' });
  console.log('Logged in');
  const data = await fetchAllSurveysForExport();
  console.log('Fetched:', data.length);
  generateCareExcel(data.slice(0, 5), 'all');
  console.log('Exported');
}
run();
