export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/20 bg-white/40 supports-[backdrop-filter]:bg-white/30 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/70 via-sky-300/60 to-blue-500/70 text-white shadow-blue-soft">
                ✦
              </div>
              <span className="font-serif text-lg tracking-wide text-slate-900">
                Sky Pegasus
              </span>
            </div>
            <p className="text-sm text-slate-600">
              用 Vibe Coding 讓創意飛翔，記錄馬年最自由的靈感。
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Explore
            </p>
            <div className="grid gap-2">
              <a href="/gallery" className="transition hover:text-slate-900">
                作品牆
              </a>
              <a href="/submit" className="transition hover:text-slate-900">
                投稿
              </a>
              <a href="/" className="transition hover:text-slate-900">
                活動說明
              </a>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Contact
            </p>
            <div className="grid gap-2">
              <span>主辦單位｜Sky Pegasus Studio</span>
              <span>Email｜usefulvibecode@gmail.com</span>
              <span>IG｜https://usefulvibecoding.com/</span>
              <span>Discord｜https://discord.gg/34fVWX3tsp</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-white/30 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Sky Pegasus. All rights reserved.</span>
          <a
            href="https://www.nextedge-ai-studio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-all duration-200 hover:scale-105 hover:text-slate-900 hover:underline"
          >
            Made by NextEdge AI Studio
          </a>
        </div>
      </div>
    </footer>
  );
}
