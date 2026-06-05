import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuration error: Missing Supabase environment variables in .env.local.');
}

// Export a single, reusable connection client typed strictly for the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);