import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/20 bg-white/40 supports-[backdrop-filter]:bg-white/30 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* 主辦單位 */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Useful Vibecode｜AI 共學社群</p>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-32 overflow-hidden rounded-lg border border-white/40 bg-white/50 shadow-sm">
                <Image
                  src="/logo.svg"
                  alt="Sky Pegasus Logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
            <div className="grid gap-1.5 text-sm text-slate-600">
              <p>Email｜usefulvibecode@gmail.com</p>
              <p>Web｜<a href="https://usefulvibecoding.com/" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">usefulvibecoding.com</a></p>
              <p>Discord｜<a href="https://discord.gg/34fVWX3tsp" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">點此加入 Discord</a></p>
              <p>Line｜<a href="https://line.me/ti/g2/FO-LwoDfH0RrlsJ2hylmAyfA04-ZYNQBUWY-ow?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">點此加入 LINE 社群</a></p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">協辦單位 1</p>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-32 overflow-hidden rounded-lg bg-white/30 p-1">
                <Image
                  src="/partner-1.png"
                  alt="VibeCoding Community Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="grid gap-1.5 text-sm text-slate-600">
              <p className="font-bold">VibeCoding 陪伴式小聚社群</p>
              <p>網頁｜<a href="https://vibecoding-community.zeabur.app/" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">vibecoding-community.zeabur.app</a></p>
              <p>Email｜ceceloveye@gmail.com</p>
              <p>Threads｜<a href="https://www.threads.com/@cecelove1209" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">@cecelove1209</a></p>
              <p>社群｜<a href="https://reurl.cc/pK0pOQ" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">點此加入陪伴式小聚</a></p>
            </div>
          </div>

          {/* 協辦單位 2 */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">NextEdge AI Studio</p>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-32 overflow-hidden rounded-lg bg-white/30 p-1">
                <Image
                  src="/partner-2.png"
                  alt="NextEdge AI Studio Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="grid gap-1.5 text-sm text-slate-600">
              <p>網頁｜<a href="https://www.nextedge-ai-studio.com/" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">nextedge-ai-studio.com</a></p>
              <p>Line｜<a href="https://page.line.me/663uegpw" target="_blank" rel="noopener" className="hover:text-sky-500 underline decoration-sky-200">@663uegpw</a></p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/30 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Sky Pegasus. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/gallery" className="hover:text-slate-900 transition underline underline-offset-4 decoration-slate-200">作品牆</a>
            <span className="text-slate-300">|</span>
            <a
              href="https://www.nextedge-ai-studio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-all duration-200 hover:text-slate-900"
            >
              Made by NextEdge AI Studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
