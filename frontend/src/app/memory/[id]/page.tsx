"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

export default function MemoryPage() {
  return (
    <motion.div {...pageTransition}>
      <PageHeader title="思い出の1ページ" showBack />

      <div className="flex flex-col items-center gap-5 px-5 pt-6">
        {/* 日付ヘッダー */}
        <p className="text-sm text-muted-foreground">2026年4月20日</p>

        {/* メイン写真 */}
        <div className="aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-mono-moss/20 to-mono-cream/50">
          <div className="flex h-full items-center justify-center text-4xl">📷</div>
        </div>

        {/* AI生成テキスト */}
        <GlassCard className="w-full max-w-sm">
          <p className="text-sm leading-relaxed text-foreground/80">
            桜並木の下で友達と笑い合った午後。風が花びらを運んできて、まるで夢の中みたい。こんな穏やかな時間がずっと続けばいいのに。
          </p>
        </GlassCard>

        {/* 感情タグ */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="chip-sage !px-3 !py-1.5 !text-xs">🐱 自由っぽい</span>
          <span className="chip-moss !px-3 !py-1.5 !text-xs">穏やか</span>
        </div>

        {/* 動物カードリンク */}
        <Link href="/animal-card/1" className="w-full max-w-sm">
          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl border-primary/30 text-sm"
            size="lg"
          >
            🐱 今日の動物カードを見る
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
