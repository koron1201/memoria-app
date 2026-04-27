"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/app-header"; // Home基準
import { pageTransition, transitions } from "@/lib/motion"; // Home基準
import Image from "next/image";

// Memoryページ専用の動物定義
export type MemoryAnimalId = "lion" | "rabbit" | "cat" | "bear" | "fox";

export interface MemoryAnimal {
  id: MemoryAnimalId;
  label: string;
  emoji: string;
  accent: string;
}

const MEMORY_ANIMALS: MemoryAnimal[] = [
  { id: "lion", label: "情熱的なライオン", emoji: "🦁", accent: "#D4847A" },
  { id: "rabbit", label: "思慮深いウサギ", emoji: "🐰", accent: "#C9A87C" },
  { id: "cat", label: "自由なネコ", emoji: "🐱", accent: "#9BB5A5" },
  { id: "bear", label: "穏やかなクマ", emoji: "🐻", accent: "#6B8F7A" },
  { id: "fox", label: "好奇心旺盛なキツネ", emoji: "🦊", accent: "#C4B59A" },
];

export function getMemoryAnimal(id: MemoryAnimalId): MemoryAnimal {
  return MEMORY_ANIMALS.find((a) => a.id === id) ?? MEMORY_ANIMALS[2]; // default to cat
}

// Homeの型に準拠した内部データ構造
interface Memory {
  id: number;
  imageUrl: string;
  diaryText: string;
  emotion: string;
  animalId: MemoryAnimalId;
  createdAt: string;
}

export default function MemoryAlbumPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMemories = async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch memories:", error);
      } else if (data) {
        // Supabaseのsnake_caseをHome基準のcamelCaseに変換して保持
        const formatted = data.map((m) => ({
          id: m.id,
          imageUrl: m.image_url,
          diaryText: m.diary_text,
          emotion: m.emotion,
          animalId: m.animal_id as MemoryAnimalId,
          createdAt: m.created_at,
        }));
        setMemories(formatted);
      }
      setLoading(false);
    };
    fetchAllMemories();
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-mono-cream/20 font-serif opacity-50">
      アルバムを開いています...
    </div>
  );
  
  if (memories.length === 0) return (
    <div className="flex min-h-screen items-center justify-center bg-mono-cream/20 font-serif opacity-50">
      まだ思い出が記録されていません。
    </div>
  );

  const current = memories[currentIndex]!;
  const animal = getMemoryAnimal(current.animalId);
  const formattedDate = new Date(current.createdAt).toLocaleDateString("ja-JP", { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < memories.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#EBE3D5] flex flex-col items-center overflow-hidden">
      {/* Home基準のヘッダー */}
      <AppHeader date={formattedDate} eyebrow="思い出アルバム" />

      <div className="relative mt-8 w-[95%] max-w-4xl aspect-[1.4/1] flex justify-center items-center">
        {/* 本の土台 */}
        <div className="absolute inset-0 bg-[#FAF9F6] shadow-2xl rounded-lg border-y-2 border-r-2 border-[#D1C7B7]" />

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 500 : -500, opacity: 0, rotateY: d > 0 ? 45 : -45 }),
              center: { x: 0, opacity: 1, rotateY: 0 },
              exit: (d: number) => ({ x: d > 0 ? -500 : 500, opacity: 0, rotateY: d > 0 ? -45 : 45 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitions.gentle} // Home基準のtransition
            className="absolute inset-0 flex"
          >
            {/* 左ページ: 写真 */}
            <div className="flex-1 bg-[#FAF9F6] border-r border-black/10 flex items-center justify-center p-8 shadow-[inset_-10px_0_10px_-10px_rgba(0,0,0,0.1)]">
              <div className="relative w-full aspect-square border-[8px] border-white shadow-md overflow-hidden bg-gray-100 rotate-[-1deg]">
                <Image src={current.imageUrl} alt="" fill className="object-cover" unoptimized />
              </div>
            </div>

            {/* 右ページ: 内容 */}
            <div className="flex-1 bg-[#FAF9F6] p-10 flex flex-col justify-center font-serif text-[#4A443F]">
              <time className="text-[10px] text-muted-foreground border-b border-[#D1C7B7] mb-4 pb-1 tracking-widest">
                {formattedDate}
              </time>
              <p className="text-sm leading-loose italic opacity-90 indent-4 min-h-[120px]">
                {current.diaryText}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {/* Home基準の色とアイコンを使用 */}
                <span 
                  className="text-[10px] px-3 py-1 rounded-full border"
                  style={{ backgroundColor: `${animal.accent}15`, color: animal.accent, borderColor: `${animal.accent}30` }}
                >
                  {animal.emoji} {animal.label}
                </span>
                <span className="text-[10px] bg-black/5 px-3 py-1 rounded-full italic opacity-60">
                  # {current.emotion}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ボタン */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20 pointer-events-none">
          <button
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
            className="size-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center disabled:opacity-0 pointer-events-auto hover:bg-white transition-all active:scale-95"
          >
            ←
          </button>
          <button
            onClick={() => paginate(1)}
            disabled={currentIndex === memories.length - 1}
            className="size-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center disabled:opacity-0 pointer-events-auto hover:bg-white transition-all active:scale-95"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-6 text-[11px] font-serif opacity-40 tracking-tighter">
        {currentIndex + 1} / {memories.length} ページ
      </div>
    </motion.div>
  );
}