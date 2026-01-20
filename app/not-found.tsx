import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl text-slate-900">找不到頁面</h1>
      <p className="text-sm text-slate-600">
        你要找的頁面不存在，請返回首頁。
      </p>
      <Link
        href="/"
        className="rounded-full border border-white/40 bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90"
      >
        回到首頁
      </Link>
    </div>
  );
}
