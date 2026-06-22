import { createClient } from '@supabase/supabase-js';

// We rely on the apps (web/mobile) to provide these via env vars, 
// or initialize them properly. 
// For shared code that might run in different environments, we export a helper
// to initialize it.

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized. Call initSupabase first.');
  }
  return supabaseInstance;
};
