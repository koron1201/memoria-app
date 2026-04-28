"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { MoodAnimal } from "@/components/mood-animal";
import { pageTransition } from "@/lib/motion";

interface Memory {
  id: string;
  animal_id: string;
  emotion: string;
  diary_text: string;
  image_url: string;
}

type AnimalConfig = {
  name: string;
  glb: string; 
  accent: string;
  sub: string;
  traits: { name: string; score: number }[];
};
// 動物ごとの設定データ（名前、3Dモデルのパス、アクセントカラー、サブテキスト、性格特性のスコア）
const ANIMAL_CONFIGS: Record<string, AnimalConfig> = {
  penguin: {
    name: "愛らしいペンギン",
    glb: "/models/animals/penguin.glb", // ← animals (複数形) に修正
    accent: "#00a8ff",
    sub: "〜 皆んなのムードメーカー 〜",
    traits: [{ name: "好奇心", score: 4 }, { name: "社交性", score: 5 }, { name: "冒険心", score: 3 }, { name: "繊細さ", score: 2 }, { name: "マイペース", score: 3 }]
  },
  rabbit: {
    name: "思慮深いウサギ",
    glb: "/models/animals/rat.glb", // ← animals (複数形) に修正
    accent: "#fab1a0",
    sub: "〜 穏やかな観察者 〜",
    traits: [{ name: "好奇心", score: 3 }, { name: "社交性", score: 3 }, { name: "冒険心", score: 2 }, { name: "繊細さ", score: 5 }, { name: "マイペース", score: 4 }]
  },
  cat: {
    name: "気まぐれネコ",
    glb: "/models/animals/cat.glb", // ← animals (複数形) に修正
    accent: "#81ecec",
    sub: "〜 自由を愛する冒険家 〜",
    traits: [{ name: "好奇心", score: 4 }, { name: "社交性", score: 2 }, { name: "冒険心", score: 5 }, { name: "繊細さ", score: 3 }, { name: "マイペース", score: 5 }]
  },
  bear: {
    name: "穏やかなクマ",
    glb: "/models/animals/bear.glb", // ← animals (複数形) に修正
    accent: "#a29bfe",
    sub: "〜 包容力のカタマリ 〜",
    traits: [{ name: "好奇心", score: 2 }, { name: "社交性", score: 4 }, { name: "冒険心", score: 2 }, { name: "繊細さ", score: 4 }, { name: "マイペース", score: 4 }]
  },
  fox: {
    name: "好奇心旺盛なキツネ",
    glb: "/models/animals/fox.glb", // ← animals (複数形) に修正
    accent: "#ffeaa7",
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
  const [actionTick, setActionTick] = useState(0);

  const handleInteract = () => {
    setActionTick((c) => c + 1);
  };

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
      <div className="flex flex-col items-center gap-5 px-5 pt-6 pb-12">
        <GlassCard className="w-full max-w-sm bg-gradient-to-br from-mono-moss/12 to-mono-cream/35 text-center p-6 shadow-elev">
          
          {/* 3Dアバター表示エリア */}
          <div className="relative mx-auto flex size-48 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-mono-sand/20 overflow-hidden ring-1 ring-white/40">
            <MoodAnimal
              src={config.glb}
              accent={config.accent}
              className="h-48 w-48"
              actionTick={actionTick}
              onInteract={handleInteract}
            />
            {/* 接地面の影 */}
            <div
              className="pointer-events-none absolute bottom-3 left-1/2 h-3 w-32 -translate-x-1/2 rounded-[50%] opacity-30 blur-md"
              style={{ background: `${config.accent}` }}
            />
          </div>
          
          <p className="mt-4 text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            Tap to interact
          </p>

          <h2 className="mt-4 text-2xl font-bold text-foreground tracking-tight">{config.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground font-medium">{config.sub}</p>

          {/* 性格特性スコア */}
          <div className="mt-6 space-y-3 px-3">
            {config.traits.map((trait) => (
              <div key={trait.name} className="flex items-center gap-4">
                <span className="w-16 text-right text-[11px] font-bold text-muted-foreground/80">{trait.name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-sm transition-all duration-300 ${i < trait.score ? "scale-110" : "text-muted-foreground/15"}`}
                      style={{ color: i < trait.score ? config.accent : undefined }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 今日の気分メモ */}
          <div className="mt-8 rounded-2xl bg-white/40 p-4 text-left border border-white/20 shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Mood focus</p>
            <p className="mt-1.5 text-base font-semibold text-foreground">「{memory.emotion || "おだやか"}」</p>
          </div>
        </GlassCard>

        <Button 
          onClick={() => router.push("/memory")} 
          className="h-14 w-full max-w-sm rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-soft hover:brightness-105 transition-all active:scale-[0.97]" 
          size="lg"
        >
          📤 アルバムへ戻る
        </Button>
      </div>
    </motion.div>
  );
}