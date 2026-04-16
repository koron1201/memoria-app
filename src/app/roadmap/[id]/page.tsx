"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";

const steps = [
  { title: "HTML/CSSの基礎を学ぶ", description: "Progateで基本を押さえよう", done: true },
  { title: "JavaScriptの基礎", description: "DOM操作やイベント処理を理解する", done: true },
  { title: "デザインツールを触る", description: "Figmaの基本操作を習得", done: false },
  { title: "ポートフォリオを作る", description: "学んだ技術で自分のサイトを公開", done: false },
  { title: "実案件に挑戦", description: "クラウドソーシングで小さな仕事から", done: false },
];

export default function RoadmapPage() {
  const progress = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return (
    <motion.div {...pageTransition}>
      <PageHeader title="ロードマップ" showBack />

      <div className="flex flex-col items-center gap-6 px-5 pt-6">
        {/* 夢タイトル */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">あなたの夢</p>
          <h2 className="mt-1 text-lg font-bold">Webデザイナーになりたい</h2>
        </div>

        {/* 進捗バー */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>進捗</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#B8A9E8]/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B8A9E8] to-[#F2B5D4] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ステップリスト */}
        <motion.div
          className="w-full max-w-sm space-y-3"
          initial="initial"
          animate="animate"
          variants={cardStagger.container}
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={cardStagger.item}>
              <GlassCard className="flex items-start gap-3 bg-white/60 p-4">
                <div className="mt-0.5">
                  {step.done ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#B8A9E8]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="size-6 rounded-full border-2 border-[#B8A9E8]/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : ""}`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
