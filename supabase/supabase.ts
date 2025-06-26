import { createClient } from "@supabase/supabase-js";

// Use environment variables with fallback to hardcoded values
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://gpjmttgqolnblfiiikra.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaXhzd3R4dnVxdHl0bmVxZ29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjUyNDMsImV4cCI6MjA1NzMwMTI0M30.-qsxItJdRegH2_wQogU7sntv_tXhi1S1tjK6fkmYHyk";

console.log(
  "Initializing Supabase client with URL:",
  supabaseUrl.substring(0, 15) + "...",
);

// Create Supabase client with additional options to handle CORS issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
