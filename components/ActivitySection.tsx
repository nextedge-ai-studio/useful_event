"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const schedule = [
  { label: "投稿開始", value: "2026 / 01 / 26" },
  { label: "投票截止", value: "2026 / 02 / 13" },
  { label: "線上小聚", value: "2026 / 02 / 28" },
  { label: "時間", value: "14:00 – 16:30" },
];

const submissionItems = [
  "作品簡介（文字即可，需清楚描述創意概念與流程設計）",
  "作品呈現（必須提供作品連結、作品圖片）",
  "短影片（選填）：可提供 30 秒說明，附上 YouTube 連結協助投票者理解",
  "每人限投稿 1 件作品",
  "投稿內容須為原創作品，不得抄襲或冒用他人創作",
];

const votingItems = [
  "採公開投票制",
  "獲得最高票數之作品即為得獎者",
  "若遇票數相同，將由主辦單位進行最終裁定",
  "若發現異常投票行為，主辦單位有權進行票數審核與必要調整",
];

const notices = [
  "投稿即視為同意主辦單位於活動期間及後續宣傳中，展示作品內容（將標註作者）",
  "主辦單位保留活動內容、規則與獎項調整之權利",
  "禁止以任何不當方式影響投票結果（包含金錢、利益交換或誘導性行為等）",
];

const qna = [
  {
    q: "什麼是 Vibe Coding？一定要寫程式嗎？",
    a: "不一定。Vibe Coding 重視的是創意、流程與體驗設計，而不是技術本身。你可以使用 no-code / low-code / code 或只用概念、Demo 來呈現想法。",
  },
  {
    q: "作品一定要完成嗎？可以只是概念嗎？",
    a: "可以，只是概念或流程設計。本活動不以完成度為評判標準，重點在於是否能清楚表達你的創作想法與體驗流程。",
  },
  {
    q: "可以使用 AI 來創作嗎？",
    a: "可以。AI 是允許使用的創作工具之一，只要作品為你自己的創意發想，且非抄襲他人內容，即符合投稿規範。",
  },
  {
    q: "評選方式是什麼？怎麼決定得獎者？",
    a: "本活動採公開投票制。投票截止時，獲得最高票數的作品為得獎者；若票數相同，將由主辦單位進行最終裁定。",
  },
  {
    q: "公開投票會不會不公平？如果有人灌票怎麼辦？",
    a: "為維護公平性，若發現異常投票行為（如大量重複投票、明顯灌票），主辦單位有權進行審核與必要處理，並保留在爭議情況下的最終裁定權。",
  },
  {
    q: "投稿作品之後會怎麼被使用？",
    a: "投稿即視為同意主辦單位於活動期間及後續宣傳中展示作品內容，並清楚標註作者。作品著作權仍屬於原作者本人。",
  },
];

const judges = [
  {
    name: "評審邀請中",
    title: "神秘嘉賓",
    description: "敬請期待",
    image: null,
  },
  {
    name: "評審邀請中",
    title: "神秘嘉賓",
    description: "敬請期待",
    image: null,
  },
  {
    name: "評審邀請中",
    title: "神秘嘉賓",
    description: "敬請期待",
    image: null,
  },
];

type Tab = "activity" | "judges" | "qna";

export default function ActivitySection() {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  return (
    <section className="py-20" id="activity">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-blue-soft transition supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-md sm:p-12">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Activity
            </p>
            <h2 className="font-serif text-3xl text-slate-900 sm:text-4xl">
              2026 過年節慶活動｜Vibe Coding 投稿活動
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start bg-slate-100/50 p-2 rounded-full w-fit mx-auto sm:mx-0 border border-white/60 shadow-inner">
              {[
                { id: "activity", label: "活動辦法" },
                { id: "judges", label: "評審陣容" },
                { id: "qna", label: "常見問題" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-8 py-3 rounded-full text-base font-medium transition-all duration-300 relative ${activeTab === tab.id
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full shadow-lg shadow-sky-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 tracking-wide">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mt-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-12"
                >
                  {/* 活動宗旨 */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl border-l-4 border-sky-400 pl-4 text-slate-800">一、活動宗旨</h3>
                    <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                      本活動以 Vibe Coding 為核心精神，鼓勵創作者以「流程、體驗與創意」為出發點，自由發揮想像力，創作出屬於馬年的「天馬行空」作品。
                      活動不以技術高低或完成度為評判標準，而是重視想法的獨特性、流程設計的清楚程度、以及創意與體驗的表達方式。
                    </p>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    <div className="space-y-8">
                      {/* 活動說明 */}
                      <div className="space-y-3">
                        <h3 className="font-serif text-xl border-l-4 border-sky-400 pl-4 text-slate-800">
                          二、活動說明
                        </h3>
                        <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
                          本活動「不限技術、不限形式」，參與者可依自身熟悉的方式進行創作。可使用任何工具、平台或技術 (包含但不限於 AI、no-code / low-code / code)。
                          重點不在是否「完成一個產品」，而在是否能清楚傳達你的創作想法與體驗流程。
                        </p>
                      </div>

                      {/* 創作主題 */}
                      <div className="space-y-3">
                        <h3 className="font-serif text-xl border-l-4 border-sky-400 pl-4 text-slate-800">
                          三、創作主題與方向
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700">創作主題：天馬行空</p>
                          <p className="text-sm text-slate-500 italic pb-1">創作方向（不限於以下）：</p>
                          <ul className="grid gap-2 text-sm text-slate-600">
                            <li className="flex gap-2"><span>✦</span> 與「馬、馬年、奔跑、自由、想像力」相關的創意概念</li>
                            <li className="flex gap-2"><span>✦</span> 有趣的使用流程、互動體驗或產品體驗設計</li>
                            <li className="flex gap-2"><span>✦</span> 能清楚說明創作動機與流程邏輯的作品或故事</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* 時程 */}
                      <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                        <h4 className="font-serif text-xl text-slate-900">四、活動時程</h4>
                        <div className="mt-4 grid gap-3">
                          {schedule.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between border-b border-white/20 pb-2"
                            >
                              <span className="text-slate-500">{item.label}</span>
                              <span className="font-medium text-slate-900">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 投稿方式 */}
                      <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                        <h4 className="font-serif text-xl text-slate-900">五、投稿方式與資格</h4>
                        <ul className="mt-4 grid gap-3">
                          {submissionItems.map((item) => (
                            <li key={item} className="leading-relaxed leading-snug">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* 評選 */}
                    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                      <h4 className="font-serif text-xl text-slate-900">六、評選方式</h4>
                      <ul className="mt-4 grid gap-3">
                        {votingItems.map((item) => (
                          <li key={item} className="leading-snug">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    {/* 獎勵 */}
                    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                      <h4 className="font-serif text-xl text-slate-900">七、活動獎勵</h4>
                      <p className="mt-4 text-base font-medium text-amber-600">
                        🎁 Zeabur AI Hub 20 美金儲值額度 × 1 名
                      </p>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        得獎名單將於投票結束後公告，並由主辦單位主動聯繫得獎者。
                      </p>
                    </div>
                    {/* 注意事項 */}
                    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
                      <h4 className="font-serif text-xl text-slate-900">八、注意事項</h4>
                      <ul className="mt-4 grid gap-3">
                        {notices.map((item) => (
                          <li key={item} className="leading-snug">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "judges" && (
                <motion.div
                  key="judges"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {judges.map((judge, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-3xl shadow-inner mx-auto">
                        {judge.image ? (
                          <Image
                            src={judge.image}
                            alt={judge.name}
                            width={96}
                            height={96}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400">?</span>
                        )}
                      </div>
                      <div className="text-center space-y-2">
                        <h4 className="text-lg font-bold text-slate-900">{judge.name}</h4>
                        <p className="text-sm font-medium text-sky-600">{judge.title}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {judge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="col-span-full mt-8 text-center">
                    <p className="text-sm text-slate-500">更多重磅評審持續邀請中...</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "qna" && (
                <motion.div
                  key="qna"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {qna.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/30 bg-white/40 p-6 shadow-sm hover:shadow-md transition group hover:bg-white/60"
                      >
                        <h4 className="font-bold text-slate-800 mb-3 flex gap-2 items-start">
                          <span className="text-sky-500 text-lg leading-none mt-0.5">Q.</span>
                          {item.q}
                        </h4>
                        <div className="pl-6 border-l-2 border-slate-200 ml-1.5">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
