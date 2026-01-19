const schedule = [
  { label: "投稿開始", value: "2026 / 1 / 26" },
  { label: "投票截止", value: "2026 / 2 / 13" },
  { label: "線上小聚", value: "2026 / 2 / 28" },
  { label: "時間", value: "14:00 – 16:30" },
];

const submissionItems = [
  "作品說明（文字即可，清楚描述創意與流程）",
  "作品呈現（連結、圖片、Demo 皆可）",
  "每人可投稿 1 件作品",
  "投稿內容需為原創，不得抄襲他人作品",
];

const votingItems = [
  "採公開投票制",
  "於投票截止時，獲得最多票數的作品即為得獎者",
  "若遇票數相同，將由主辦單位進行最終裁定",
];

const notices = [
  "投稿即視為同意主辦單位於活動期間及後續宣傳中，展示作品內容（會標註作者）",
  "主辦單位保留活動內容、規則與獎項調整之權利",
  "若發現違反活動精神或不當行為，主辦單位有權取消參賽資格",
];

export default function ActivitySection() {
  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-white/30 bg-white/60 p-8 shadow-blue-soft transition supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md sm:p-12">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Activity
            </p>
            <h2 className="font-serif text-3xl text-slate-900 sm:text-4xl">
              2026 過年節慶活動｜Vibe Coding 投稿活動
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              為迎接馬年新春，我們邀請所有創作者一起用 Vibe Coding
              發揮想像力，用「流程、體驗、創意」說一個屬於你的馬年故事。
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="font-serif text-2xl text-slate-900">
                  活動說明
                </h3>
                <p className="text-sm text-slate-600 sm:text-base">
                  本活動鼓勵參與者以 Vibe Coding 的方式進行創作，不侷限技術、
                  不限制形式，只要你的作品能展現「天馬行空」的精神，並與「馬年」
                  或創意發想有所連結，即可參加。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-xl text-slate-900">
                  創作主題與形式
                </h4>
                <p className="text-sm text-slate-600">
                  創作主題：天馬行空
                </p>
                <ul className="grid gap-3 text-sm text-slate-600">
                  <li>與「馬、馬年、奔跑、自由、想像力」相關的創意概念</li>
                  <li>一個有趣的使用流程、互動體驗或產品體驗</li>
                  <li>一段體驗設計、服務流程或是故事型流程</li>
                </ul>
                <p className="text-sm text-slate-600">
                  不侷限技術：可使用任何工具、平台、AI、no-code / low-code / code，
                  不限前端、Demo、Prototype。重點不在完成度，而在想法、流程與創意表達。
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                <h4 className="font-serif text-xl text-slate-900">活動時程</h4>
                <div className="mt-4 grid gap-3">
                  {schedule.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-white/40 pb-2"
                    >
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium text-slate-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                <h4 className="font-serif text-xl text-slate-900">投稿方式</h4>
                <ul className="mt-4 grid gap-3">
                  {submissionItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
              <h4 className="font-serif text-xl text-slate-900">評選方式</h4>
              <ul className="mt-4 grid gap-3">
                {votingItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
              <h4 className="font-serif text-xl text-slate-900">活動獎勵</h4>
              <p className="mt-4 text-base font-medium text-amber-500">
                🎁 Zeabur AI Hub 20 美金儲值額度 × 1 名
              </p>
              <p className="mt-2 text-xs text-slate-500">
                獎項將於投票結束後公告，並由主辦單位主動聯繫得獎者。
              </p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
              <h4 className="font-serif text-xl text-slate-900">注意事項</h4>
              <ul className="mt-4 grid gap-3">
                {notices.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
