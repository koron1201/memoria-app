"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/avatar";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";
import { useOnboarding } from "./hooks/useOnboarding";

const recentMemories = [
  { id: "1", date: "4月15日", emoji: "🐱", mood: "自由っぽい", thumbnail: null },
  { id: "2", date: "4月14日", emoji: "🐻", mood: "穏やか", thumbnail: null },
  { id: "3", date: "4月13日", emoji: "🦊", mood: "好奇心旺盛", thumbnail: null },
];

export default function Home() {
  const { isChecking } = useOnboarding();
  if (isChecking) {
    return null;
  }
  return (
    <motion.div
      className="flex flex-col items-center gap-6 px-5 pt-8"
      {...pageTransition}
    >
      {/* アバターエリア */}
      <section className="flex flex-col items-center gap-3">
        <Avatar size="lg" />
        <div className="text-center">
          <p className="text-2xl font-bold">おかえり 👋</p>
          <p className="mt-1 text-sm text-muted-foreground">
            今日の気分は <span className="text-[#B8A9E8]">🐱 自由っぽい</span>
          </p>
        </div>
      </section>

      {/* クイックアクション */}
      <section className="flex w-full max-w-sm gap-3">
        <Link href="/upload" className="flex-1">
          <GlassCard className="flex flex-col items-center gap-2 bg-gradient-to-br from-[#B8A9E8]/10 to-[#F2B5D4]/10 text-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <span className="text-2xl">📷</span>
            <span className="text-sm font-medium">思い出を記録する</span>
          </GlassCard>
        </Link>
        <Link href="/tanzaku" className="flex-1">
          <GlassCard className="flex flex-col items-center gap-2 bg-gradient-to-br from-[#89CFF0]/10 to-[#B8A9E8]/10 text-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <span className="text-2xl">⭐</span>
            <span className="text-sm font-medium">夢を書く</span>
          </GlassCard>
        </Link>
      </section>

      {/* 最近の思い出 */}
      <section className="w-full max-w-sm">
        <h2 className="mb-3 text-base font-medium">最近の思い出</h2>
        <motion.div
          className="flex flex-col gap-2.5"
          initial="initial"
          animate="animate"
          variants={cardStagger.container}
        >
          {recentMemories.map((memory) => (
            <motion.div key={memory.id} variants={cardStagger.item}>
              <Link href={`/memory/${memory.id}`}>
                <GlassCard className="flex items-center gap-4 bg-white/60 p-4 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8A9E8]/20 to-[#F2B5D4]/20 text-xl">
                    {memory.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{memory.mood}</p>
                    <p className="text-xs text-muted-foreground">{memory.date}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}
