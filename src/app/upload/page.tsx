"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

export default function UploadPage() {
  return (
    <motion.div {...pageTransition}>
      <PageHeader title="思い出を記録する" showBack />

      <div className="flex flex-col items-center gap-6 px-5 pt-6">
        {/* 写真選択エリア */}
        <GlassCard className="flex w-full max-w-sm flex-col items-center gap-4 border-2 border-dashed border-[#B8A9E8]/30 bg-gradient-to-br from-[#B8A9E8]/5 to-[#F2B5D4]/5 py-10">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#B8A9E8]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B8A9E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">写真を選択</p>
            <p className="mt-1 text-xs text-muted-foreground">タップして写真を選ぶ</p>
          </div>
        </GlassCard>

        {/* テキスト入力 */}
        <div className="w-full max-w-sm">
          <label className="mb-2 block text-sm font-medium">ひとこと日記</label>
          <textarea
            placeholder="今日はどんな日だった？"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-white/60 p-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground/50 focus:border-[#B8A9E8] focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20"
          />
        </div>

        <Button
          className="h-12 w-full max-w-sm rounded-2xl bg-[#B8A9E8] text-base font-medium text-white hover:bg-[#a898d8]"
          size="lg"
        >
          ✨ 解析する
        </Button>
      </div>
    </motion.div>
  );
}
