import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rgdcehpynsfllenfidei.supabase.co"
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGNlaHB5bnNmbGxlbmZpZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzY2MDQsImV4cCI6MjEwNzc1MjYwNH0.3GAS_TqKXS8Z0g5CUKZrB0ean3dE72ia1aLV-4OhCuw"
).trim();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
