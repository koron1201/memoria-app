"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/avatar";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

export default function ProfilePage() {
  return (
    <motion.div {...pageTransition}>
      <div className="flex flex-col items-center gap-6 px-5 pt-10">
        <Avatar size="lg" />
        <div className="text-center">
          <h1 className="text-xl font-bold">ゲストユーザー</h1>
          <p className="mt-1 text-sm text-muted-foreground">MEMORIA に参加中</p>
        </div>

        {/* 設定メニュー */}
        <div className="w-full max-w-sm space-y-2.5">
          <GlassCard className="flex items-center justify-between bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium">ニックネーム編集</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </GlassCard>

          <GlassCard className="flex items-center justify-between bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔔</span>
              <span className="text-sm font-medium">通知設定</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </GlassCard>

          <GlassCard className="flex items-center justify-between bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">ℹ️</span>
              <span className="text-sm font-medium">アカウント情報</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </GlassCard>
        </div>

        <Button
          variant="outline"
          className="h-11 w-full max-w-sm rounded-2xl border-[#FF6B6B]/30 text-sm text-[#FF6B6B] hover:bg-[#FF6B6B]/5"
          size="lg"
        >
          ログアウト
        </Button>
      </div>
    </motion.div>
  );
}
