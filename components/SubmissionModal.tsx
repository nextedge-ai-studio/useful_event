"use client";

import { useState } from "react";
import SubmissionForm from "@/components/SubmissionForm";
import { useSubmissionDeadline } from "@/lib/hooks/useSubmissionDeadline";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SubmissionModal() {
  const [open, setOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEnded = useSubmissionDeadline();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isEnded}
        >
          {isEnded ? "投稿已截止" : "我要投稿 (Submit)"}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>作品投稿</DialogTitle>
          <DialogDescription>
            分享你的創意作品，讓大家一同感受天馬行空。
          </DialogDescription>
        </DialogHeader>
        {!canSubmit && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
            您已經投稿過。如需修改投稿，請在登入內修改。
          </div>
        )}
        <SubmissionForm
          variant="modal"
          formId="submission-modal-form"
          onSuccess={() => setOpen(false)}
          onCanSubmitChange={setCanSubmit}
          onSubmittingChange={setIsSubmitting}
        />
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-full border border-white/50 bg-white/60 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
            >
              取消
            </button>
          </DialogClose>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
            form="submission-modal-form"
            disabled={!canSubmit || isSubmitting || isEnded}
          >
            {isEnded
              ? "活動已截止"
              : isSubmitting
                ? "送出中..."
                : "送出投稿"
            }
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
