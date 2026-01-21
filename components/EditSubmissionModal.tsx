"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

type SubmissionData = {
  id: string;
  title: string;
  author_name: string;
  description: string;
  demo_url: string | null;
  youtube_url: string | null;
  image_url: string | null;
  image_urls: string[] | null;
};

type EditSubmissionModalProps = {
  work: SubmissionData;
  onUpdated?: () => void;
};

type MessageState = {
  type: "success" | "error";
  text: string;
};

export default function EditSubmissionModal({
  work,
  onUpdated,
}: EditSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(work.title);
  const [authorName, setAuthorName] = useState(work.author_name);
  const [description, setDescription] = useState(work.description);
  const [demoUrl, setDemoUrl] = useState(work.demo_url ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(work.youtube_url ?? "");
  const [imageUrlsText, setImageUrlsText] = useState(
    (work.image_urls && work.image_urls.length > 0
      ? work.image_urls
      : work.image_url
        ? [work.image_url]
        : []
    ).join("\n")
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [activePreview, setActivePreview] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSubmit = async () => {
    setMessage(null);

    if (!supabase || !isSupabaseEnabled) {
      setMessage({ type: "error", text: "尚未設定 Supabase，無法更新。" });
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      setMessage({ type: "error", text: "請先登入後再更新。" });
      return;
    }

    if (!title || !authorName || !description || !demoUrl) {
      setMessage({ type: "error", text: "請先完成必填欄位。" });
      return;
    }

    setIsSubmitting(true);

    const parsedUrls = imageUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let uploadedImageUrls: string[] = parsedUrls;
    let uploadedImageUrl = uploadedImageUrls[0] || null;

    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((item) => formData.append("files", item));
      formData.append("userId", userId);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        setMessage({
          type: "error",
          text: errorData?.error || "圖片上傳失敗",
        });
        setIsSubmitting(false);
        return;
      }

      const uploadData = await uploadResponse.json();
      uploadedImageUrls = Array.isArray(uploadData.urls) ? uploadData.urls : [];
      uploadedImageUrl = uploadedImageUrls[0] || null;
    }

    const { error } = await supabase
      .from("works")
      .update({
        title,
        author_name: authorName,
        description,
        demo_url: demoUrl || null,
        youtube_url: youtubeUrl || null,
        image_url: uploadedImageUrl,
        image_urls: uploadedImageUrls,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
      })
      .eq("id", work.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsSubmitting(false);
      return;
    }

    setMessage({ type: "success", text: "已送出更新，等待重新審核。" });
    setIsSubmitting(false);
    setOpen(false);
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white/80">
          編輯
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯投稿</DialogTitle>
          <DialogDescription>
            更新內容後會重新進入審核流程。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              標題
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              作者
              <input
                type="text"
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">作品圖片（可多張）</p>
            <div className="rounded-2xl border border-white/30 bg-white/60 p-4 shadow-blue-soft supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
              {previewUrls.length === 0 ? (
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
                      const imageFiles = Array.from(droppedFiles).filter((f) =>
                        f.type.startsWith("image/")
                      );
                      if (imageFiles.length > 0) {
                        setFiles(imageFiles);
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
        </div>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <button className="rounded-full border border-white/50 bg-white/60 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30">
              取消
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isSupabaseEnabled}
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          >
            {isSubmitting ? "送出中..." : "送出更新"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
