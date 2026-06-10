import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function assertSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }
}

export const supabase = createClient(
  supabaseUrl ?? "https://missing-project.supabase.co",
  supabasePublishableKey ?? "missing-publishable-key"
);
