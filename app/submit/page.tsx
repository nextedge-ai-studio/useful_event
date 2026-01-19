import RejectedNotice from "@/components/RejectedNotice";
import SubmissionForm from "@/components/SubmissionForm";
import MySubmissions from "@/components/MySubmissions";

export default function SubmitPage() {
  return (
    <div className="min-h-screen">
      <main className="pt-24">
        <RejectedNotice />
        <section className="py-16">
          <div className="mx-auto w-full max-w-4xl px-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl">
                  我的投稿
                </h1>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  My Submissions
                </span>
              </div>
              <MySubmissions />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
