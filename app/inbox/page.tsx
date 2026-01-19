import InboxList from "@/components/InboxList";

export default function InboxPage() {
  return (
    <div className="min-h-screen">
      <main className="pt-24">
        <section className="py-16">
          <div className="mx-auto w-full max-w-4xl px-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Inbox
              </p>
              <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl">
                通知中心
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                投稿與審核結果會在這裡通知你。
              </p>
            </div>
            <div className="mt-8">
              <InboxList />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
