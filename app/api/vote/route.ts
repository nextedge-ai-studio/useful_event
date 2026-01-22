
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSubmissionEnded } from "@/lib/submission-config";

export async function POST(request: NextRequest) {
    // 1. 檢查截止日期
    if (isSubmissionEnded()) {
        return NextResponse.json(
            { error: "投票活動已截止，無法再進行投票。" },
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

        // 2. 初始化 Supabase Client
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

        // 4. 解析請求 (Work ID)
        const body = await request.json();
        const { workId } = body;

        if (!workId) {
            return NextResponse.json(
                { error: "缺少 Work ID" },
                { status: 400 }
            );
        }

        // 5. 檢查目前是否已投票
        const { data: existingVote } = await supabase
            .from("votes")
            .select("id")
            .eq("user_id", user.id)
            .eq("work_id", workId)
            .single();

        let result;
        let isVoted = false;

        if (existingVote) {
            // 已投票 -> 取消投票
            const { error: deleteError } = await supabase
                .from("votes")
                .delete()
                .eq("id", existingVote.id);

            if (deleteError) throw deleteError;
            isVoted = false;
        } else {
            // 未投票 -> 新增投票
            const { error: insertError } = await supabase
                .from("votes")
                .insert({
                    user_id: user.id,
                    work_id: workId
                });

            if (insertError) throw insertError;
            isVoted = true;
        }

        // 6. 取得最新票數
        const { count } = await supabase
            .from("votes")
            .select("id", { count: "exact", head: true })
            .eq("work_id", workId);

        return NextResponse.json({
            success: true,
            isVoted,
            voteCount: count || 0
        });

    } catch (err: any) {
        console.error("Vote error:", err);
        return NextResponse.json(
            { error: err.message || "伺服器發生錯誤" },
            { status: 500 }
        );
    }
}
