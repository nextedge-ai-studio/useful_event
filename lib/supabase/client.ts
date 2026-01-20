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
      },
      // 關閉 realtime 避免 WebSocket 連線問題
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
      // 全域設定
      global: {
        headers: {
          'x-client-info': 'useful-event-web',
        },
      },
    })
    : null;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
