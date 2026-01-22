"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import GalleryGrid from "@/components/GalleryGrid";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";
import { useSubmissionDeadline } from "@/lib/hooks/useSubmissionDeadline";

type WorkRow = {
  id: string;
  title: string;
  author_name: string;
  description: string;
  image_url: string | null;
  image_urls: string[] | null;
  youtube_url: string | null;
  demo_url: string | null;
  status: string;
  created_at: string;
  vote_count: number;
};

const fallbackGradients = [
  "linear-gradient(135deg, rgba(147,197,253,0.6), rgba(59,130,246,0.6))",
  "linear-gradient(140deg, rgba(186,230,253,0.7), rgba(125,211,252,0.7))",
  "linear-gradient(140deg, rgba(96,165,250,0.7), rgba(129,140,248,0.7))",
  "linear-gradient(135deg, rgba(191,219,254,0.7), rgba(147,197,253,0.7))",
  "linear-gradient(140deg, rgba(125,211,252,0.6), rgba(186,230,253,0.7))",
  "linear-gradient(140deg, rgba(129,140,248,0.6), rgba(96,165,250,0.7))",
];

export default function GallerySection() {
  const [works, setWorks] = useState<WorkRow[]>([]);
  const [voteMap, setVoteMap] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEnded = useSubmissionDeadline();



  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!supabase || !isSupabaseEnabled) {
        setIsLoading(false);
        setErrorMessage("Supabase 尚未設定，無法載入作品。");
        return;
      }

      // 先載入作品
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase
          .from("works_with_votes")
          .select(
            "id,title,author_name,description,image_url,image_urls,youtube_url,demo_url,status,created_at,vote_count"
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        setWorks(data ?? []);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "載入作品時發生未知錯誤";
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      // 作品載入完成後，再載入使用者投票狀態（非阻塞）
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentUser = sessionData.session?.user ?? null;
        setUserId(currentUser?.id ?? null);

        if (currentUser?.id) {
          const { data: voteData } = await supabase
            .from("votes")
            .select("work_id")
            .eq("user_id", currentUser.id);

          if (!isMounted) return;

          const map: Record<string, boolean> = {};
          voteData?.forEach((vote) => {
            map[vote.work_id] = true;
          });
          setVoteMap(map);
        }
      } catch {
        // 投票狀態載入失敗不影響主要功能
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleVote = useCallback(
    async (workId: string) => {
      if (!supabase || !isSupabaseEnabled) {
        setErrorMessage("Supabase 尚未設定，無法投票。");
        return;
      }

      if (!userId) {
        setErrorMessage("請先登入後再投票。");
        return;
      }

      if (pendingVotes[workId]) {
        return;
      }

      if (isEnded) {
        setErrorMessage("投票活動已截止，無法再進行投票。");
        return;
      }

      const hasVoted = Boolean(voteMap[workId]);

      setPendingVotes((prev) => ({ ...prev, [workId]: true }));
      setVoteMap((prev) => ({ ...prev, [workId]: !hasVoted }));
      setWorks((prev) =>
        prev.map((work) =>
          work.id === workId
            ? {
              ...work,
              vote_count: hasVoted
                ? Math.max(0, work.vote_count - 1)
                : work.vote_count + 1,
            }
            : work
        )
      );

      // 改為呼叫 API 進行投票
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setErrorMessage("登入狀態已過期，請重新登入。");
        setPendingVotes((prev) => ({ ...prev, [workId]: false }));
        // 回滾樂觀更新
        setVoteMap((prev) => ({ ...prev, [workId]: hasVoted }));
        setWorks((prev) =>
          prev.map((work) =>
            work.id === workId
              ? {
                ...work,
                vote_count: hasVoted
                  ? work.vote_count + 1
                  : Math.max(0, work.vote_count - 1),
              }
              : work
          )
        );
        return;
      }

      try {
        const response = await fetch("/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ workId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "投票失敗");
        }

        // 使用伺服器回傳的正確票數更新
        setWorks((prev) =>
          prev.map((work) =>
            work.id === workId ? { ...work, vote_count: result.voteCount } : work
          )
        );
        // 確認狀態同步
        setVoteMap((prev) => ({ ...prev, [workId]: result.isVoted }));

      } catch (err: any) {
        setErrorMessage(err.message);
        // 回滾樂觀更新
        setVoteMap((prev) => ({ ...prev, [workId]: hasVoted }));
        setWorks((prev) =>
          prev.map((work) =>
            work.id === workId
              ? {
                ...work,
                vote_count: hasVoted
                  ? work.vote_count + 1
                  : Math.max(0, work.vote_count - 1),
              }
              : work
          )
        );
      }
      setPendingVotes((prev) => ({ ...prev, [workId]: false }));
    },
    [userId, voteMap, pendingVotes]
  );

  const mappedWorks = useMemo(
    () =>
      works.map((work, index) => ({
        id: work.id,
        title: work.title,
        author: work.author_name,
        description: work.description,
        voteCount: work.vote_count ?? 0,
        hasVoted: Boolean(voteMap[work.id]),
        imageUrl: work.image_url,
        imageUrls: work.image_urls ?? [],
        youtubeUrl: work.youtube_url,
        demoUrl: work.demo_url,
        gradient: fallbackGradients[index % fallbackGradients.length],
        onVote: handleVote,
        votingDisabled: !isSupabaseEnabled || Boolean(pendingVotes[work.id]) || isEnded,
      })),
    [works, voteMap, handleVote, pendingVotes, isEnded]
  );

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-700 sm:flex-row sm:justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-200"
            >
              重試
            </button>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
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
            作品載入中...
          </div>
        </div>
      ) : (
        <GalleryGrid works={mappedWorks} />
      )}
    </div>
  );
}
