"use client";

import { useEffect, useState } from "react"; // 追加
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

// 動物ごとの設定（アイコンや名前を出し分けるため）
const ANIMAL_MAP: Record<string, { label: string; icon: string; color: string }> = {
  lion: { label: "情熱的なライオン", icon: "🦁", color: "#F2B5D4" },
  rabbit: { label: "思慮深いウサギ", icon: "🐰", color: "#B8A9E8" },
  cat: { label: "自由なネコ", icon: "🐱", color: "#89CFF0" },
  bear: { label: "穏やかなクマ", icon: "🐻", color: "#A8DADC" },
  fox: { label: "好奇心旺盛なキツネ", icon: "🦊", color: "#FFD166" },
};

export default function MemoryPage() {
  const [data, setData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // localStorageからデータを取り出す
    const savedAnalysis = localStorage.getItem("last_analysis");
    const savedImage = localStorage.getItem("last_image");

    if (savedAnalysis) setData(JSON.parse(savedAnalysis));
    if (savedImage) setImageUrl(savedImage);
  }, []);

  // データがない時の表示
  if (!data) return <div className="p-10 text-center">思い出を読み込み中...</div>;

  // animalIdに基づいてアイコンなどの設定を取得
  const animalConfig = ANIMAL_MAP[data.animalId] || ANIMAL_MAP.cat;

  return (
    <motion.div {...pageTransition}>
      <PageHeader title="思い出の1ページ" showBack />

      <div className="flex flex-col items-center gap-5 px-5 pt-6">
        {/* 日付ヘッダー（今日の日付にするともっと「思い出帳」っぽい！） */}
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* メイン写真（localStorageのURLを表示） */}
        <div className="aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-[#B8A9E8]/20 to-[#F2B5D4]/20">
          {imageUrl ? (
            <img src={imageUrl} alt="Memory" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">📷</div>
          )}
        </div>

        {/* AI生成テキスト（Geminiが書いた文章） */}
        <GlassCard className="w-full max-w-sm bg-white/60">
          <p className="text-sm leading-relaxed text-foreground/80 italic">
            {data.diaryText}
          </p>
        </GlassCard>

        {/* 感情タグ（動的に変更） */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-[#B8A9E8]/15 px-3 py-1.5 text-xs font-medium text-[#B8A9E8]">
            {animalConfig.icon} {animalConfig.label}
          </span>
          <span className="rounded-full bg-[#89CFF0]/15 px-3 py-1.5 text-xs font-medium text-[#89CFF0]">
            {data.emotion}
          </span>
        </div>

        {/* 動物カードリンク */}
        <Link href={`/animal-card/${data.animalId}`} className="w-full max-w-sm">
          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl border-[#B8A9E8]/30 text-sm"
            size="lg"
          >
            {animalConfig.icon} 今日の動物カードを見る
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}