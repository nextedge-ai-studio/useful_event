"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!supabase || !isSupabaseEnabled) {
      return;
    }

    const loadUser = async () => {
      if (!supabase || !isSupabaseEnabled) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };

    loadUser();

    if (!supabase || !isSupabaseEnabled) {
      return;
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase || !isSupabaseEnabled) {
      console.warn("Supabase is not configured yet.");
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window === "undefined" ? undefined : window.location.origin,
        },
      });
      if (error) {
        console.error("Google login error:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/20 bg-white/50 supports-[backdrop-filter]:bg-white/40 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/70 via-sky-300/60 to-blue-500/70 text-white shadow-blue-soft">
            ✦
          </div>
          <span className="font-serif text-lg tracking-wide text-slate-900">
            Sky Pegasus
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/gallery"
            className="text-sm text-slate-600 transition hover:text-slate-900"
          >
            作品牆
          </Link>
          {userEmail ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full border border-white/40 bg-white/50 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
              >
                {userEmail}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/40 bg-white/80 p-2 text-sm text-slate-600 shadow-blue-soft supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-md">
                  <Link
                    href="/inbox"
                    className="block rounded-xl px-3 py-2 transition hover:bg-white/70 hover:text-slate-900"
                  >
                    通知中心
                  </Link>
                  <Link
                    href="/submit"
                    className="block rounded-xl px-3 py-2 transition hover:bg-white/70 hover:text-slate-900"
                  >
                    我的投稿
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (supabase) {
                        await supabase.auth.signOut();
                      }
                      setMenuOpen(false);
                    }}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-white/70 hover:text-slate-900"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading || !isSupabaseEnabled}
              className="rounded-full border border-white/40 bg-white/50 px-5 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
            >
              {!isSupabaseEnabled
                ? "尚未設定 Supabase"
                : isLoading
                ? "連線中..."
                : "Google 登入"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
