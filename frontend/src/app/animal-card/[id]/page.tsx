"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

const traits = [
  { name: "好奇心", score: 4 },
  { name: "社交性", score: 2 },
  { name: "冒険心", score: 5 },
  { name: "繊細さ", score: 3 },
  { name: "マイペース", score: 5 },
];

export default function AnimalCardPage() {
  return (
    <motion.div {...pageTransition}>
      <PageHeader title="動物カード" showBack />

      <div className="flex flex-col items-center gap-5 px-5 pt-6">
        <GlassCard className="w-full max-w-sm bg-gradient-to-br from-[#B8A9E8]/10 to-[#F2B5D4]/10 text-center">
          {/* 動物イラスト */}
          <div className="mx-auto flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#B8A9E8]/20 to-[#F2B5D4]/20">
            <span className="text-6xl">🐱</span>
          </div>

          <h2 className="mt-4 text-xl font-bold">気まぐれネコ</h2>
          <p className="mt-1 text-sm text-muted-foreground">〜 自由を愛する冒険家 〜</p>

          {/* 性格特性 */}
          <div className="mt-5 space-y-2.5">
            {traits.map((trait) => (
              <div key={trait.name} className="flex items-center gap-3">
                <span className="w-20 text-right text-xs text-muted-foreground">{trait.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < trait.score ? "text-[#FFD700]" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 感情メモ */}
          <div className="mt-5 rounded-xl bg-white/40 p-3">
            <p className="text-xs text-muted-foreground">今日の感情メモ</p>
            <p className="mt-1 text-sm">
              「自由気ままに過ごした穏やかな午後」
            </p>
          </div>
        </GlassCard>

        <Button
          className="h-12 w-full max-w-sm rounded-2xl bg-[#B8A9E8] text-base font-medium text-white hover:bg-[#a898d8]"
          size="lg"
        >
          📤 シェアする
        </Button>
      </div>
    </motion.div>
  );
}
