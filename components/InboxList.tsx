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

    const loadNotifications = async () => {
      if (!supabase || !isSupabaseEnabled) {
        setIsLoading(false);
        setErrorMessage("Supabase 尚未設定，無法載入通知。");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;

        if (!userId) {
          setIsLoading(false);
          setErrorMessage("請先登入後查看通知。");
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("id,title,body,created_at,read_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        setItems(data ?? []);
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "載入通知時發生未知錯誤";
        setErrorMessage(errorMessage);
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/60 p-8 text-center text-sm text-slate-500 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
        通知載入中...
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
