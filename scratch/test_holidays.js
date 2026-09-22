const https = require('https');

const SUPABASE_URL = 'https://looezwqzqumajqlavgvt.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2V6d3F6cXVtYWpxbGF2Z3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTc1MjQsImV4cCI6MjA5NzY3MzUyNH0.pFRZt5C_5OmJq_X99w6uLY6mYCrJeR79WjfdbSjIxFk';

// Try inserting a test row to verify the table doesn't exist via anon key
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Test the holidays table with direct insert
async function test() {
  const { data, error } = await supabase
    .from('holidays')
    .insert([{ holiday_date: '2026-10-02', description: 'Gandhi Jayanti' }])
    .select();
  console.log('Insert result:', { data, error });
  
  // Try select
  const { data: d2, error: e2 } = await supabase.from('holidays').select('*');
  console.log('Select result:', { data: d2, error: e2 });
}

test();
