import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

function getConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) {
    return { supabaseUrl: url, supabaseKey: key };
  }
  return null;
}

export function initSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const config = getConfig();
  if (!config?.supabaseUrl || !config?.supabaseKey) {
    return null;
  }
  supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
  return supabaseClient;
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return getConfig() !== null;
}
