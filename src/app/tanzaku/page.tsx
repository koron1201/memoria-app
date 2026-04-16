"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageTransition, cardStagger } from "@/lib/motion";

const pastTanzaku = [
  { id: "1", dream: "Webデザイナーになりたい", date: "4月10日" },
  { id: "2", dream: "毎朝ランニングする習慣をつけたい", date: "4月5日" },
];

export default function TanzakuPage() {
  const [dream, setDream] = useState("");

  return (
    <motion.div {...pageTransition}>
      <PageHeader title="短冊ドリームロード" showBack />

      <div className="flex flex-col items-center gap-6 px-5 pt-6">
        {/* 短冊入力エリア */}
        <div className="relative w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFF8E7] to-[#FFE4C4] p-6 shadow-lg">
            {/* 短冊の穴 */}
            <div className="mx-auto mb-4 h-3 w-8 rounded-full bg-[#D4A574]/30" />

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-[#8B7355]/60">あなたの夢を書いてください</p>
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="Webデザイナーになりたい"
                rows={3}
                className="w-full resize-none bg-transparent text-center text-lg font-medium leading-relaxed text-[#5A4A3A] placeholder:text-[#8B7355]/30 focus:outline-none"
              />
            </div>

            {/* 期限設定 */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-[#8B7355]/60">期限（任意）</span>
              <Input
                type="date"
                className="h-8 w-36 border-[#D4A574]/30 bg-white/50 text-center text-xs"
              />
            </div>
          </div>

          {/* 短冊の紐 */}
          <div className="absolute -top-3 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-[#D4A574]/40" />
        </div>

        <Button
          className="h-12 w-full max-w-sm rounded-2xl bg-[#B8A9E8] text-base font-medium text-white hover:bg-[#a898d8] disabled:opacity-40"
          disabled={!dream.trim()}
        >
          ✨ ロードマップを作る
        </Button>

        {/* 過去の短冊一覧 */}
        <section className="w-full max-w-sm">
          <h2 className="mb-3 text-base font-medium">過去の短冊</h2>
          <motion.div
            className="flex flex-col gap-2.5"
            initial="initial"
            animate="animate"
            variants={cardStagger.container}
          >
            {pastTanzaku.map((item) => (
              <motion.div key={item.id} variants={cardStagger.item}>
                <GlassCard className="flex items-center gap-4 bg-gradient-to-r from-[#FFF8E7]/60 to-[#FFE4C4]/40 p-4">
                  <span className="text-xl">🎋</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.dream}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
