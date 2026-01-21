"use client";

import { useEffect, useState } from "react";

import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export default function InboxList() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !isSupabaseEnabled) {
      setIsLoading(false);
      setErrorMessage("Supabase 尚未設定，無法載入通知。");
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      if (!supabase || !isSupabaseEnabled) {
        if (isMounted) {
          setIsLoading(false);
          setErrorMessage("Supabase 尚未設定，無法載入通知。");
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;

        if (!userId) {
          if (isMounted) {
            setItems([]);
            setErrorMessage("請先登入後查看通知。");
          }
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("id,title,body,created_at,read_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setItems(data ?? []);
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "載入通知時發生未知錯誤";
        setErrorMessage(msg);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // 初次載入
    loadNotifications();

    // 監聽登入狀態變化，登入後自動重新載入通知
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        // 當登入狀態改變時重新載入通知
        loadNotifications();
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/60 p-8 text-center shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          通知載入中...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-700">
        {errorMessage}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/60 p-8 text-center text-sm text-slate-500 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
        目前還沒有通知。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-slate-900">{item.title}</h3>
            <span className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleString("zh-TW")}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
