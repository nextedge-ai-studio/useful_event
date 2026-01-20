"use client";

export default function GlobalError() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl text-slate-900">發生錯誤</h1>
      <p className="text-sm text-slate-600">
        系統暫時發生問題，請稍後再試或重新整理頁面。
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full border border-white/40 bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90"
      >
        重新整理
      </button>
    </div>
  );
}
