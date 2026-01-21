import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: -1,
        },
      },
      global: {
        headers: {
          'x-client-info': 'useful-event-web',
        },
      },
      db: {
        schema: 'public',
      },
    })
    : null;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
