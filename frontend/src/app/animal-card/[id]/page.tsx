"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

// 型定義を追加
interface Memory {
  id: string;
  animal_id: string;
  emotion: string;
  diary_text: string;
  image_url: string;
}

const ANIMAL_CONFIGS: Record<string, { name: string; emoji: string; sub: string; traits: { name: string; score: number }[] }> = {
  lion: {
    name: "情熱的なライオン",
    emoji: "🦁",
    sub: "〜 誇り高きリーダー 〜",
    traits: [{ name: "好奇心", score: 5 }, { name: "社交性", score: 4 }, { name: "冒険心", score: 5 }, { name: "繊細さ", score: 2 }, { name: "マイペース", score: 3 }]
  },
  rabbit: {
    name: "思慮深いウサギ",
    emoji: "🐰",
    sub: "〜 穏やかな観察者 〜",
    traits: [{ name: "好奇心", score: 3 }, { name: "社交性", score: 3 }, { name: "冒険心", score: 2 }, { name: "繊細さ", score: 5 }, { name: "マイペース", score: 4 }]
  },
  cat: {
    name: "気まぐれネコ",
    emoji: "🐱",
    sub: "〜 自由を愛する冒険家 〜",
    traits: [{ name: "好奇心", score: 4 }, { name: "社交性", score: 2 }, { name: "冒険心", score: 5 }, { name: "繊細さ", score: 3 }, { name: "マイペース", score: 5 }]
  },
  bear: {
    name: "穏やかなクマ",
    emoji: "🐻",
    sub: "〜 包容力のカタマリ 〜",
    traits: [{ name: "好奇心", score: 2 }, { name: "社交性", score: 4 }, { name: "冒険心", score: 2 }, { name: "繊細さ", score: 4 }, { name: "マイペース", score: 4 }]
  },
  fox: {
    name: "好奇心旺盛なキツネ",
    emoji: "🦊",
    sub: "〜 知恵ある探求者 〜",
    traits: [{ name: "好奇心", score: 5 }, { name: "社交性", score: 3 }, { name: "冒険心", score: 4 }, { name: "繊細さ", score: 3 }, { name: "マイペース", score: 3 }]
  },
};

export default function AnimalCardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching memory:", error.message);
        } else {
          setMemory(data as Memory);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-mono-cream/20">カードを生成中...</div>;
  if (!memory) return <div className="flex min-h-screen items-center justify-center bg-mono-cream/20">データが見つかりませんでした。</div>;

  const config = ANIMAL_CONFIGS[memory.animal_id] || ANIMAL_CONFIGS.cat;

  return (
    <motion.div {...pageTransition}>
      <PageHeader title="動物カード" showBack />
      <div className="flex flex-col items-center gap-5 px-5 pt-6">
        <GlassCard className="w-full max-w-sm bg-gradient-to-br from-mono-moss/12 to-mono-cream/35 text-center">
          <div className="mx-auto flex size-28 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary/15 to-mono-sand/25">
            <span className="text-6xl">{config.emoji}</span>
          </div>
          <h2 className="mt-4 text-xl font-bold">{config.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{config.sub}</p>
          <div className="mt-5 space-y-2.5">
            {config.traits.map((trait) => (
              <div key={trait.name} className="flex items-center gap-3">
                <span className="w-20 text-right text-xs text-muted-foreground">{trait.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm transition-transform ${i < trait.score ? "text-mono-sand scale-105" : "text-muted-foreground/30"}`}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-white/40 p-3 text-left">
            <p className="text-xs text-muted-foreground">この思い出の気分</p>
            <p className="mt-1 text-sm font-medium">「{memory.emotion || "おだやか"}」</p>
          </div>
        </GlassCard>
        <Button onClick={() => router.push("/memory")} className="h-12 w-full max-w-sm rounded-2xl bg-primary text-base font-medium text-primary-foreground shadow-soft hover:bg-primary/90" size="lg">
          📤 アルバムへ戻る
        </Button>
      </div>
    </motion.div>
  );
}