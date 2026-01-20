"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import EditSubmissionModal from "@/components/EditSubmissionModal";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

type SubmissionRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  review_note: string | null;
  description: string;
  author_name: string;
  demo_url: string | null;
  youtube_url: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  vote_count: number;
};

const statusMap: Record<string, { label: string; style: string }> = {
  pending: {
    label: "待審核",
    style: "bg-amber-100 text-amber-700 border-amber-200",
  },
  approved: {
    label: "已通過",
    style: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "未通過",
    style: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export default function MySubmissions() {
  const [items, setItems] = useState<SubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSubmissions = async () => {
    if (!supabase || !isSupabaseEnabled) {
      setIsLoading(false);
      setErrorMessage("Supabase 尚未設定，無法載入投稿。");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setErrorMessage("請先登入後查看投稿。");
        return;
      }

      const { data, error } = await supabase
        .from("works_with_votes")
        .select(
          "id,title,status,created_at,review_note,description,author_name,demo_url,youtube_url,image_url,image_urls,vote_count"
        )
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setItems(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "載入投稿時發生未知錯誤";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
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
          投稿載入中...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    const isColumnMissing = errorMessage.includes("youtube_url") || errorMessage.includes("column");
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-700">
        <p className="font-semibold mb-2">載入失敗：{errorMessage}</p>
        {isColumnMissing && (
          <p className="mt-2 text-amber-600 bg-white/50 p-3 rounded-xl border border-amber-100">
            提示：看起來是資料庫尚未更新。請確保已執行完畢目前的 SQL Migration 檔案以新增 <code>youtube_url</code> 欄位。
          </p>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/60 p-8 text-center text-sm text-slate-500 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
        目前還沒有投稿作品。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const status = statusMap[item.status] ?? statusMap.pending;
        return (
          <article
            key={item.id}
            className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-xl text-slate-900">
                  {item.title}
                </h3>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.style}`}
                >
                  {status.label}
                </span>
                <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.vote_count ?? 0}</span>
                </div>
              </div>
              <EditSubmissionModal
                work={{
                  id: item.id,
                  title: item.title,
                  author_name: item.author_name,
                  description: item.description,
                  demo_url: item.demo_url,
                  youtube_url: item.youtube_url,
                  image_url: item.image_url,
                  image_urls: item.image_urls,
                }}
                onUpdated={loadSubmissions}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              投稿時間：{new Date(item.created_at).toLocaleString("zh-TW")}
            </div>
            {item.review_note && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-700">
                {item.review_note}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
