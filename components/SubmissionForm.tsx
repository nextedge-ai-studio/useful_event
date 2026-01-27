"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";
import { useSubmissionDeadline } from "@/lib/hooks/useSubmissionDeadline";

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

type UploadItem = {
  id: string;
  file?: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  remoteUrl?: string;
  error?: string;
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

  // Replace simple files state with uploadItems
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [activePreview, setActivePreview] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const isEnded = useSubmissionDeadline();

  // Combined preview URLs from manual text and upload items
  const combinedPreviewUrls = useMemo(() => {
    const textUrls = imageUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Use previewUrl (blob) for pending/uploading/error, remoteUrl for success if available
    // But for consistency in display, we might just stick to the preview blob 
    // until we need to submit. However, if we want to show the processed image...
    // Let's stick to the local preview for the UI to be snappy.
    const fileUrls = uploadItems.map(item => item.previewUrl);

    return [...fileUrls, ...textUrls];
  }, [uploadItems, imageUrlsText]);

  useEffect(() => {
    if (activePreview >= combinedPreviewUrls.length) {
      setActivePreview(0);
    }
  }, [activePreview, combinedPreviewUrls.length]);

  // Clean up Blob URLs
  useEffect(() => {
    // Create a list of URLs to revoke when component unmounts or items change
    // We only need to revoke the ones we created (from uploadItems)
    const urlsToRevoke = uploadItems.map(item => item.previewUrl);
    return () => {
      urlsToRevoke.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [uploadItems]);

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

  const uploadImage = async (item: UploadItem) => {
    if (!item.file) return;

    setUploadItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: 'uploading' } : i
    ));

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("請先登入");
      }

      const formData = new FormData();
      formData.append("files", item.file); // API expects "files" even for single

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData?.error || "上傳失敗");
      }

      const uploadData = await uploadResponse.json();
      const urls = Array.isArray(uploadData.urls) ? uploadData.urls : [];
      const remoteUrl = urls[0];

      if (!remoteUrl) {
        throw new Error("未回傳圖片網址");
      }

      setUploadItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: 'success', remoteUrl } : i
      ));

    } catch (err: any) {
      console.error(err);
      setUploadItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: 'error', error: err.message } : i
      ));
    }
  };

  const handleFileSelect = (newFiles: File[]) => {
    const newItems: UploadItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file), // Immediate preview
      status: 'pending'
    }));

    setUploadItems(prev => [...prev, ...newItems]);

    // Trigger upload for each new item
    newItems.forEach(item => {
      uploadImage(item);
    });
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

    // Check if any uploads are still in progress
    const isUploading = uploadItems.some(item => item.status === 'uploading' || item.status === 'pending');
    if (isUploading) {
      setMessage({ type: "error", text: "圖片正在處理中，請稍候..." });
      return;
    }

    // Check for failed uploads
    const hasErrors = uploadItems.some(item => item.status === 'error');
    if (hasErrors) {
      setMessage({ type: "error", text: "有圖片上傳失敗，請移除或重試後再送出。" });
      return;
    }

    if (!supabase || !isSupabaseEnabled) {
      setMessage({ type: "error", text: "尚未設定 Supabase，無法投稿。" });
      return;
    }

    if (isEnded) {
      setMessage({ type: "error", text: "投稿活動已截止，無法再進行投稿。" });
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

    if ((uploadItems.length > 0) && !isSupabaseEnabled) {
      setMessage({ type: "error", text: "尚未設定 Supabase，無法上傳。" });
      return;
    }

    setIsSubmitting(true);
    onSubmittingChange?.(true);

    const parsedUrls = imageUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Collect success URLs from uploadItems
    const uploadedUrls = uploadItems
      .filter(item => item.status === 'success' && item.remoteUrl)
      .map(item => item.remoteUrl!);

    const finalImageUrls = [...uploadedUrls, ...parsedUrls];
    const finalImageUrl = finalImageUrls[0] || null;

    // 改為呼叫 API 進行投稿
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setMessage({ type: "error", text: "登入狀態已過期，請重新登入。" });
      setIsSubmitting(false);
      onSubmittingChange?.(false);
      return;
    }

    const response = await fetch("/api/works/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title,
        author_name: authorName,
        description,
        image_url: finalImageUrl,
        image_urls: finalImageUrls,
        youtube_url: youtubeUrl || null,
        demo_url: demoUrl || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage({ type: "error", text: result.error || "投稿失敗" });
      setIsSubmitting(false);
      onSubmittingChange?.(false);
      return;
    }

    setTitle("");
    setAuthorName("");
    setDescription("");
    setImageUrlsText("");
    setDemoUrl("");
    setYoutubeUrl("");
    setUploadItems([]); // Clear uploads
    setMessage({ type: "success", text: "投稿成功，等待審核。" });
    setIsSubmitting(false);
    onSubmittingChange?.(false);
    onSuccess?.();
    setCanSubmit(false);
    onCanSubmitChange?.(false);
  };

  const currentUploadItem = activePreview < uploadItems.length ? uploadItems[activePreview] : null;

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
          {combinedPreviewUrls.length === 0 ? (
            <label
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center text-sm text-slate-600 transition ${isDragging
                ? "border-sky-400 bg-sky-50/50"
                : "border-white/50 bg-white/50 hover:border-sky-300"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const droppedFiles = e.dataTransfer.files;
                if (droppedFiles && droppedFiles.length > 0) {
                  if (droppedFiles.length > 1) {
                    setMessage({ type: "error", text: "一次僅能上傳一張圖片" });
                  }

                  const firstFile = droppedFiles[0];
                  if (firstFile.type.startsWith("image/")) {
                    handleFileSelect([firstFile]);
                  }
                }
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-sky-500 shadow-sm">
                <span className="text-lg">⬆</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700">
                  {isDragging ? "放開以上傳圖片" : "拖放圖片到這裡，或點擊上傳"}
                </p>
                <p className="text-xs text-slate-500">
                  支援 PNG / JPG，建議 1200px 以上
                </p>
              </div>
              <span className="rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold text-slate-700">
                選擇圖片（單張選擇）
              </span>
              <input
                type="file"
                accept="image/*"
                // Removed 'multiple' to enforce single selection via dialog
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    handleFileSelect(Array.from(event.target.files));
                    // Reset input so same file can be selected again if needed
                    event.target.value = "";
                  }
                }}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full">
                <div
                  className="h-[210px] w-full rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${combinedPreviewUrls[activePreview]})`,
                  }}
                />

                {/* Upload Status Overlay */}
                {currentUploadItem && currentUploadItem.status === 'uploading' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/40 backdrop-blur-[2px]">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="mt-2 text-xs font-medium text-white">處理中...</span>
                  </div>
                )}

                {/* Error Overlay */}
                {currentUploadItem && currentUploadItem.status === 'error' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-red-500/80 backdrop-blur-[2px] px-4 text-center">
                    <span className="text-2xl">⚠️</span>
                    <span className="mt-1 text-xs font-bold text-white">上傳失敗</span>
                    <span className="text-[10px] text-white/90">{currentUploadItem.error}</span>
                    <button
                      type="button"
                      onClick={() => uploadImage(currentUploadItem)}
                      className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600 shadow-sm"
                    >
                      重試
                    </button>
                  </div>
                )}

                {/* Success Indicator (Optional, but nice) */}
                {currentUploadItem && currentUploadItem.status === 'success' && (
                  <div className="absolute right-3 bottom-3 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    ✓ 已上傳
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm z-20">
                  {activePreview + 1}/{combinedPreviewUrls.length}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Logic to remove the current item
                    if (activePreview < uploadItems.length) {
                      // Removing an uploaded item
                      setUploadItems(prev => prev.filter((_, i) => i !== activePreview));
                    } else {
                      // Removing a manual URL
                      const manualIndex = activePreview - uploadItems.length;
                      const lines = imageUrlsText.split("\n").filter((l) => l.trim().length > 0);
                      const newLines = lines.filter((_, i) => i !== manualIndex);
                      setImageUrlsText(newLines.join("\n"));
                    }

                    if (activePreview >= combinedPreviewUrls.length - 1) {
                      setActivePreview(Math.max(0, combinedPreviewUrls.length - 2));
                    }
                  }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs text-slate-600 shadow-sm transition hover:bg-red-100 hover:text-red-600 z-20"
                >
                  ✕
                </button>
                {combinedPreviewUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreview((prev) =>
                          prev === 0 ? combinedPreviewUrls.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white z-20"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreview((prev) =>
                          prev === combinedPreviewUrls.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white z-20"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {combinedPreviewUrls.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {combinedPreviewUrls.map((_, index) => (
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

              <div className="flex gap-2">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-900/20">
                  <span>＋ 新增更多圖片</span>
                  <input
                    type="file"
                    accept="image/*"
                    // Removed multiple here too
                    className="sr-only"
                    onChange={(event) => {
                      if (event.target.files && event.target.files.length > 0) {
                        handleFileSelect(Array.from(event.target.files));
                        event.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
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
            disabled={isSubmitting || !isSupabaseEnabled || !canSubmit || isEnded}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          >
            {isEnded
              ? "活動已截止"
              : isSubmitting
                ? "送出中..."
                : (uploadItems.some(i => i.status === 'uploading' || i.status === 'pending') ? "圖片處理中..." : "送出投稿")
            }
          </button>
        </div>
      )}
    </form>
  );
}
