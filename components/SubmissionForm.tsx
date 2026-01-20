"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

type SubmissionFormProps = {
  variant?: "page" | "modal";
  formId?: string;
  onSuccess?: () => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type MessageState = {
  type: "success" | "error";
  text: string;
};

export default function SubmissionForm({
  variant = "page",
  formId = "submission-form",
  onSuccess,
  onCanSubmitChange,
  onSubmittingChange,
}: SubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [activePreview, setActivePreview] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");

  const previewUrls = useMemo(() => {
    const urlPreviews = imageUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const filePreviews = files.map((item) => URL.createObjectURL(item));
    return files.length > 0 ? filePreviews : urlPreviews;
  }, [files, imageUrlsText]);

  useEffect(() => {
    if (activePreview >= previewUrls.length) {
      setActivePreview(0);
    }
  }, [activePreview, previewUrls.length]);

  useEffect(() => {
    if (files.length === 0) {
      return;
    }
    // 當有文件時，previewUrls 就是由文件創建的 object URLs，需要清理
    const urlsToRevoke = files.length > 0 ? [...previewUrls] : [];
    return () => {
      urlsToRevoke.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [files, previewUrls]);

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      return;
    }
    const nextText = imageUrlsText
      ? `${imageUrlsText}\n${trimmed}`
      : trimmed;
    setImageUrlsText(nextText);
    setNewImageUrl("");
  };

  useEffect(() => {
    if (!supabase || !isSupabaseEnabled) {
      return;
    }

    const loadSession = async () => {
      if (!supabase || !isSupabaseEnabled) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      const currentUserId = data.session?.user?.id ?? null;
      setUserId(currentUserId);
      if (currentUserId) {
        const { count } = await supabase
          .from("works")
          .select("id", { count: "exact", head: true })
          .eq("created_by", currentUserId);
        const nextCanSubmit = (count ?? 0) < 1;
        setCanSubmit(nextCanSubmit);
        onCanSubmitChange?.(nextCanSubmit);
      } else {
        setCanSubmit(true);
        onCanSubmitChange?.(true);
      }
    };

    loadSession();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!supabase || !isSupabaseEnabled) {
      setMessage({ type: "error", text: "尚未設定 Supabase，無法投稿。" });
      return;
    }

    if (!userId) {
      setMessage({ type: "error", text: "請先登入後再投稿。" });
      return;
    }

    if (!canSubmit) {
      setMessage({ type: "error", text: "每人僅能投稿 1 件作品。" });
      return;
    }
    if (!title || !authorName || !description || !demoUrl) {
      setMessage({ type: "error", text: "請先完成必填欄位。" });
      return;
    }

    if (files.length > 0 && !isSupabaseEnabled) {
      setMessage({ type: "error", text: "尚未設定 Supabase，無法上傳。" });
      return;
    }

    setIsSubmitting(true);
    onSubmittingChange?.(true);

    const parsedUrls = imageUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let uploadedImageUrls: string[] = parsedUrls;
    let uploadedImageUrl = uploadedImageUrls[0] || null;
    if (files.length > 0) {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setMessage({ type: "error", text: "登入狀態已過期，請重新登入。" });
        setIsSubmitting(false);
        onSubmittingChange?.(false);
        return;
      }
      const formData = new FormData();
      files.forEach((item) => formData.append("files", item));
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        setMessage({
          type: "error",
          text: errorData?.error || "圖片上傳失敗",
        });
        setIsSubmitting(false);
        onSubmittingChange?.(false);
        return;
      }

      const uploadData = await uploadResponse.json();
      uploadedImageUrls = Array.isArray(uploadData.urls) ? uploadData.urls : [];
      uploadedImageUrl = uploadedImageUrls[0] || null;
    }

    const { data: workData, error } = await supabase
      .from("works")
      .insert({
        title,
        author_name: authorName,
        description,
        image_url: uploadedImageUrl,
        image_urls: uploadedImageUrls,
        youtube_url: youtubeUrl || null,
        demo_url: demoUrl || null,
        created_by: userId,
      })
      .select("id");

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsSubmitting(false);
      onSubmittingChange?.(false);
      return;
    }

    if (workData && workData[0]?.id) {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "投稿成功",
        body: "你的作品已送出，正在等待審核。",
      });
    }

    setTitle("");
    setAuthorName("");
    setDescription("");
    setImageUrlsText("");
    setDemoUrl("");
    setYoutubeUrl("");
    setFiles([]);
    setMessage({ type: "success", text: "投稿成功，等待審核。" });
    setIsSubmitting(false);
    onSubmittingChange?.(false);
    onSuccess?.();
    setCanSubmit(false);
    onCanSubmitChange?.(false);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={variant === "page" ? "space-y-5" : "mt-6 space-y-4"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          標題
          <input
            type="text"
            placeholder="作品名稱"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          作者
          <input
            type="text"
            placeholder="你的名字"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        作品連結（必填）
        <input
          type="url"
          placeholder="https://..."
          value={demoUrl}
          onChange={(event) => setDemoUrl(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        YouTube 影片連結（選填）
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(event) => setYoutubeUrl(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        作品描述
        <textarea
          rows={4}
          placeholder="一句話描述你的靈感與技術亮點"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </label>
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">作品圖片（可多張）</p>
        <div className="rounded-2xl border border-white/30 bg-white/60 p-4 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
          {previewUrls.length === 0 ? (
            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/50 bg-white/50 px-4 py-8 text-center text-sm text-slate-600 transition hover:border-sky-300 sm:px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-sky-500 shadow-sm">
                <span className="text-lg">⬆</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700">
                  拖放圖片到這裡，或點擊上傳
                </p>
                <p className="text-xs text-slate-500">
                  支援 PNG / JPG，建議 1200px 以上
                </p>
              </div>
              <span className="rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold text-slate-700">
                選擇圖片（可多選）
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setFiles(
                    event.target.files ? Array.from(event.target.files) : []
                  )
                }
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full">
                <div
                  className="h-[210px] w-full rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${previewUrls[activePreview]})`,
                  }}
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  {activePreview + 1}/{previewUrls.length}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (files.length > 0) {
                      const newFiles = files.filter((_, i) => i !== activePreview);
                      setFiles(newFiles);
                    } else {
                      const lines = imageUrlsText.split("\n").filter((_, i) => i !== activePreview);
                      setImageUrlsText(lines.join("\n"));
                    }
                    if (activePreview >= previewUrls.length - 1) {
                      setActivePreview(Math.max(0, previewUrls.length - 2));
                    }
                  }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs text-slate-600 shadow-sm transition hover:bg-red-100 hover:text-red-600"
                >
                  ✕
                </button>
                {previewUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreview((prev) =>
                          prev === 0 ? previewUrls.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreview((prev) =>
                          prev === previewUrls.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {previewUrls.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {previewUrls.map((_, index) => (
                    <button
                      key={`preview-${index}`}
                      type="button"
                      onClick={() => setActivePreview(index)}
                      className={`h-1.5 w-5 rounded-full transition ${index === activePreview
                        ? "bg-slate-500"
                        : "bg-slate-300"
                        }`}
                    />
                  ))}
                </div>
              )}
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-900/20">
                <span>＋ 新增更多圖片</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) {
                      setFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
                    }
                  }}
                />
              </label>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500">或貼上圖片連結</p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={newImageUrl}
                onChange={(event) => setNewImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className="flex-1 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-xs text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-900/20"
              >
                加入
              </button>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success"
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
            : "border-amber-200 bg-amber-50/80 text-amber-700"
            }`}
        >
          {message.text}
        </div>
      )}
      {variant === "page" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-full border border-white/50 bg-white/60 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseEnabled || !canSubmit}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          >
            {isSubmitting ? "送出中..." : "送出投稿"}
          </button>
        </div>
      )}
    </form>
  );
}
