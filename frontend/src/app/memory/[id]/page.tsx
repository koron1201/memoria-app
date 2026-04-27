"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/app-header";
import { GlassCard } from "@/components/glass-card";
import { pageTransition } from "@/lib/motion";

export type MemoryAnimalId = "lion" | "rabbit" | "cat" | "bear" | "fox";

// 表示用の型定義
interface Memory {
  id: string | number;
  date: string;
  animalId: MemoryAnimalId;
  diaryText: string;
  imageUrl: string;
  emotion: string;
}

// 動物データの定義
const MEMORY_ANIMALS = [
  { id: "lion", label: "情熱的なライオン", emoji: "🦁", accent: "#D4847A" },
  { id: "rabbit", label: "思慮深いウサギ", emoji: "🐰", accent: "#C9A87C" },
  { id: "cat", label: "自由なネコ", emoji: "🐱", accent: "#9BB5A5" },
  { id: "bear", label: "穏やかなクマ", emoji: "🐻", accent: "#6B8F7A" },
  { id: "fox", label: "好奇心旺盛なキツネ", emoji: "🦊", accent: "#C4B59A" },
];

function getLocalAnimal(id: string) {
  return MEMORY_ANIMALS.find((a) => a.id === id) || MEMORY_ANIMALS[2];
}

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  // useState<any> を <Memory | null> に修正
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMemory = async () => {
      if (!id) return;
      
      try {
        const { data: dbData, error } = await supabase
          .from("memories")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching latest memory:", error.message);
        } else if (dbData) {
          setMemory({
            id: dbData.id,
            date: new Date(dbData.created_at).toLocaleDateString("ja-JP", {
              month: "long", day: "numeric",
            }),
            animalId: dbData.animal_id as MemoryAnimalId,
            diaryText: dbData.diary_text || "",
            imageUrl: dbData.image_url,
            emotion: dbData.emotion || "おだやか",
          });
        }
      } catch (err) {
        // catch (error: any) を避けるため、err として受け取る
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestMemory();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-mono-cream/20 font-serif opacity-50">AIが言葉を綴っています...</div>;
  if (!memory) return <div className="flex min-h-screen items-center justify-center bg-mono-cream/20">思い出が見つかりませんでした。</div>;

  const animal = getLocalAnimal(memory.animalId);

  return (
    <motion.div {...pageTransition} className="relative min-h-screen pb-12">
      <motion.div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background: `radial-gradient(94% 62% at 50% 11%, color-mix(in oklab, ${animal.accent} 12%, transparent) 0%, transparent 64%)`,
        }}
      />

      <AppHeader date={memory.date} eyebrow="AI 解析完了" />

      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 pt-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] shadow-elev ring-1 ring-white/45">
          <Image src={memory.imageUrl} alt="Analyzed" fill className="object-cover" unoptimized />
        </div>

        <GlassCard className="p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 border-b border-mono-ink/5 pb-2">
            <span className="text-2xl">{animal.emoji}</span>
            <p className="text-[10px] font-bold tracking-[0.2em] text-primary/70 uppercase">AI Diary</p>
          </div>
          <p className="text-sm leading-relaxed text-mono-ink/90 italic indent-4">{memory.diaryText}</p>
        </GlassCard>

        {/* 感情タグ */}
        <div className="flex flex-wrap justify-center gap-2.5 opacity-80">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/40 px-4 py-1 text-[11px] font-medium text-mono-ink backdrop-blur-md">
            <span className="size-1.5 rounded-full" style={{ background: animal.accent }} />
            {animal.label}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/30 bg-black/5 px-4 py-1 text-[11px] italic text-mono-ink/60">
            # {memory.emotion}
          </span>
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-3">✨ この思い出はアルバムに安全に保管されました</p>
            <button
              onClick={() => router.push(`/animal-card/${memory.id}`)}
              className="h-14 w-full rounded-2xl bg-mono-ink text-white shadow-xl hover:bg-mono-ink/90 transition-all active:scale-[0.97] flex items-center justify-center gap-2 group"
            >
              <span className="font-bold">診断カードを受け取る</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">🃏</span>
            </button>
          </div>

          <button
            onClick={() => router.push("/memory")}
            className="text-xs text-mono-ink/50 underline decoration-mono-ink/20 hover:text-mono-ink transition-colors"
          >
            カードを見ずにアルバムへ戻る
          </button>
        </div>
      </div>
    </motion.div>
  );
}