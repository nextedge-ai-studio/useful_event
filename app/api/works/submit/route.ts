
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSubmissionEnded } from "@/lib/submission-config";

export async function POST(request: NextRequest) {
    // 1. 檢查截止日期
    if (isSubmissionEnded()) {
        return NextResponse.json(
            { error: "投稿活動已截止，無法再進行投稿。" },
            { status: 403 }
        );
    }

    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "未授權的操作" },
                { status: 401 }
            );
        }

        // 2. 初始化 Supabase Client (使用使用者的 Token)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
            auth: {
                persistSession: false,
            },
        });

        // 3. 取得使用者資訊
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "無法驗證使用者身分" },
                { status: 401 }
            );
        }

        // 4. 驗證請求資料
        const body = await request.json();
        const {
            title,
            author_name,
            description,
            image_url,
            image_urls,
            youtube_url,
            demo_url,
        } = body;

        if (!title || !author_name || !description || !demo_url) {
            return NextResponse.json(
                { error: "請填寫所有必填欄位" },
                { status: 400 }
            );
        }

        // 5. 檢查是否已經投稿過 (重複檢查)
        const { count } = await supabase
            .from("works")
            .select("id", { count: "exact", head: true })
            .eq("created_by", user.id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: "每人僅能投稿 1 件作品" },
                { status: 400 }
            );
        }

        // 6. 寫入資料庫
        const { data: workData, error: insertError } = await supabase
            .from("works")
            .insert({
                title,
                author_name,
                description,
                image_url,
                image_urls,
                youtube_url: youtube_url || null,
                demo_url: demo_url || null,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Submission error:", insertError);
            return NextResponse.json(
                { error: insertError.message || "投稿失敗" },
                { status: 500 }
            );
        }

        // 7. 寫入通知 (Optional failure is ok)
        await supabase.from("notifications").insert({
            user_id: user.id,
            title: "投稿成功",
            body: "你的作品已送出，正在等待審核。",
        });

        return NextResponse.json({ success: true, id: workData.id });

    } catch (err: any) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "伺服器發生錯誤" },
            { status: 500 }
        );
    }
}
