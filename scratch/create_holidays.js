const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const d = fs.readFileSync('apps/web/.env', 'utf8');
const urlMatch = d.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = d.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  const sql = `
    CREATE TABLE IF NOT EXISTS public.holidays (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      holiday_date date NOT NULL,
      description text,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
    CREATE POLICY IF NOT EXISTS "Allow all" ON public.holidays FOR ALL USING (true) WITH CHECK (true);
  `;
  
  supabase.rpc('exec_sql', { sql }).then(r => console.log('RPC result:', r));
}
