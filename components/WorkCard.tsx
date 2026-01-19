"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

type WorkCardProps = {
  id: string;
  title: string;
  author: string;
  description: string;
  voteCount: number;
  hasVoted: boolean;
  imageUrl?: string | null;
  imageUrls?: string[];
  demoUrl?: string | null;
  gradient?: string;
  onVote?: (id: string) => void;
  votingDisabled?: boolean;
};

export default function WorkCard({
  id,
  title,
  author,
  description,
  voteCount,
  hasVoted,
  imageUrl,
  imageUrls = [],
  demoUrl,
  gradient,
  onVote,
  votingDisabled,
}: WorkCardProps) {
  const [popKey, setPopKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopKey((prev) => prev + 1);
    onVote?.(id);
  };

  const handleCardClick = () => {
    if (demoUrl) {
      window.open(demoUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const fallbackGradient =
    gradient ||
    "linear-gradient(140deg, rgba(191,219,254,0.7), rgba(147,197,253,0.7))";

  const images = imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
  const canSlide = images.length > 1;
  const activeImage = images[activeIndex];

  return (
    <article
      onClick={handleCardClick}
      className={`break-inside-avoid rounded-2xl border border-white/30 bg-white/60 p-5 shadow-blue-soft transition hover:-translate-y-2 supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md ${
        demoUrl ? "cursor-pointer" : ""
      }`}
      title={demoUrl ? "點擊前往作品連結" : undefined}
    >
      <div className="relative">
        <div
          className="aspect-[4/3] w-full rounded-xl bg-cover bg-center"
          style={{
            backgroundImage: activeImage
              ? `url(${activeImage})`
              : fallbackGradient,
          }}
        />
        {canSlide && (
          <>
            <button
              type="button"
              onClick={(e) => {
                handleSlideClick(e);
                setActiveIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                );
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                handleSlideClick(e);
                setActiveIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:bg-white"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] text-slate-600 shadow-sm">
              {images.map((_, index) => (
                <span
                  key={`${id}-dot-${index}`}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === activeIndex ? "bg-slate-500" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">by {author}</p>
          </div>
          <button
            type="button"
            onClick={handleVote}
            disabled={votingDisabled}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <motion.span
              key={popKey}
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.4 }}
              className={hasVoted ? "text-amber-400" : "text-slate-400"}
            >
              <Heart className="h-4 w-4" fill={hasVoted ? "currentColor" : "none"} />
            </motion.span>
            {voteCount}
          </button>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </article>
  );
}
