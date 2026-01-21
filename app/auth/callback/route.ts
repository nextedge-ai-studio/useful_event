import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;

    // 從 Supabase OAuth 回調取得 code
    const code = searchParams.get("code");
    const redirectedFrom = searchParams.get("redirectedFrom") || "/";

    if (!code) {
        // 沒有 code，直接導回首頁
        return NextResponse.redirect(new URL("/", origin));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(new URL("/", origin));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    // 用 code 換取 session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        console.error("OAuth callback error:", error?.message);
        return NextResponse.redirect(new URL("/", origin));
    }

    const { access_token, expires_in } = data.session;

    // 設置 cookie
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expires_in,
    });

    // 導向原本要去的頁面
    return NextResponse.redirect(new URL(redirectedFrom, origin));
}
