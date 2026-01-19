"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SubmissionModal from "@/components/SubmissionModal";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative pt-32">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.4 : 1.1, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }
            className="inline-flex items-center rounded-full border border-white/40 bg-white/50 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 shadow-sm"
          >
            2026 Vibe Coding
          </motion.div>
          <h1 className="font-serif text-5xl text-slate-900 sm:text-6xl">
            天馬行空
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            2026 Vibe Coding Creative Event
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <SubmissionModal />
            <Link
              href="/gallery"
              className="rounded-full border border-white/40 bg-white/50 px-6 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
            >
              欣賞作品 (Gallery)
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
