"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { extractYouTubeId } from "@/lib/utils";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

type WorkDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work: {
    title: string;
    author: string;
    description: string;
    imageUrls: string[];
    youtubeUrl?: string | null;
    demoUrl?: string | null;
  };
};

export default function WorkDetailModal({
  open,
  onOpenChange,
  work,
}: WorkDetailModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 取得 YouTube 影片 ID
  const videoId = work.youtubeUrl ? extractYouTubeId(work.youtubeUrl) : null;
  const hasImages = work.imageUrls.length > 0;
  const canSlide = work.imageUrls.length > 1;

  // 當 modal 關閉時重置 activeIndex
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setActiveIndex(0);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogTitle className="sr-only">{work.title}</DialogTitle>
        <VisuallyHidden>
          <DialogDescription>{work.description}</DialogDescription>
        </VisuallyHidden>
        <div className="space-y-6">
          {/* YouTube 影片（優先顯示）或圖片輪播 */}
          {videoId ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={`${work.title} - YouTube video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : hasImages ? (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100/50">
                <Image
                  src={work.imageUrls[activeIndex]}
                  alt={`${work.title} - 圖片 ${activeIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain"
                  loader={({ src }) => src}
                  unoptimized
                />
              </div>
              {canSlide && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) =>
                        prev === 0 ? work.imageUrls.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) =>
                        prev === work.imageUrls.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/70 px-3 py-1.5 shadow-sm">
                    {work.imageUrls.map((_, index) => (
                      <button
                        key={`modal-dot-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-slate-600" : "bg-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* 標題與作者 */}
          <div>
            <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">
              {work.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">by {work.author}</p>
          </div>

          {/* 說明 */}
          <div className="rounded-2xl border border-white/30 bg-white/60 p-6 supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md">
            <h3 className="mb-3 font-serif text-lg text-slate-900">作品說明</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {work.description}
            </p>
          </div>

          {/* 作品連結 */}
          {work.demoUrl && (
            <div className="flex justify-center">
              <a
                href={work.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <ExternalLink className="h-4 w-4" />
                前往作品連結
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
