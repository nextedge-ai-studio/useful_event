"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isSupabaseEnabled, supabase } from "@/lib/supabase/client";

type RejectedWork = {
  title: string;
  review_note: string | null;
  reviewed_at: string | null;
};

export default function RejectedNotice() {
  const [open, setOpen] = useState(false);
  const [work, setWork] = useState<RejectedWork | null>(null);

  useEffect(() => {
    if (!supabase || !isSupabaseEnabled) {
      return;
    }

    const loadRejected = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        return;
      }

      const { data } = await supabase
        .from("works")
        .select("title, review_note, reviewed_at")
        .eq("created_by", userId)
        .eq("status", "rejected")
        .order("reviewed_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setWork(data[0]);
        setOpen(true);
      }
    };

    loadRejected();
  }, []);

  if (!work) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿未通過審核</DialogTitle>
          <DialogDescription>
            你的作品「{work.title}」未通過審核。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-700">
          {work.review_note ? work.review_note : "若有疑問請聯繫主辦單位。"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
