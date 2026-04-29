"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/app-header"; // Home基準
import { pageTransition, transitions } from "@/lib/motion"; // Home基準
import Image from "next/image";
import { toAlbumMemory, type MemoryAlbumItem, type MemoryAnimalId } from "@/lib/memory-records";
import { cn } from "@/lib/utils";

// Memoryページ専用の動物定義
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

function formatMemoryDate(createdAt: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MemoryAlbumPage() {
  const [memories, setMemories] = useState<MemoryAlbumItem[]>([]);
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
        setMemories(data.map(toAlbumMemory));
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
  const formattedDate = formatMemoryDate(current.createdAt);

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < memories.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  const selectMemory = (nextIndex: number) => {
    if (nextIndex === currentIndex) return;
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setCurrentIndex(nextIndex);
  };

  return (
    <motion.div {...pageTransition} className="min-h-screen overflow-hidden bg-[#EBE3D5]">
      {/* Home基準のヘッダー */}
      <AppHeader date={formattedDate} eyebrow="思い出アルバム" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-5 pb-10 pt-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-5 lg:pt-7">
        <div className="min-w-0">
          <div className="relative mx-auto flex aspect-[1.4/1] w-full max-w-5xl items-center justify-center">
            {/* 本の土台 */}
            <div className="absolute inset-0 rounded-xl border-y-2 border-r-2 border-[#D1C7B7] bg-[#FAF9F6] shadow-2xl" />
            <div
              className="pointer-events-none absolute inset-y-5 left-1/2 z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-black/12 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/55"
              aria-hidden
            />

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
                <div className="flex flex-1 items-center justify-center border-r border-black/10 bg-[#FAF9F6] p-4 shadow-[inset_-10px_0_10px_-10px_rgba(0,0,0,0.1)] sm:p-8">
                  <div className="relative aspect-square w-full rotate-[-1deg] overflow-hidden border-[6px] border-white bg-gray-100 shadow-lg sm:border-[8px]">
                    <Image src={current.imageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                </div>

                {/* 右ページ: 内容 */}
                <div className="flex flex-1 flex-col justify-center bg-[#FAF9F6] p-5 font-serif text-[#4A443F] sm:p-10">
                  <time className="mb-4 border-b border-[#D1C7B7] pb-1 text-[10px] tracking-widest text-muted-foreground">
                    {formattedDate}
                  </time>
                  <p className="min-h-[7.5rem] overflow-hidden text-xs leading-loose opacity-90 [display:-webkit-box] [-webkit-line-clamp:8] [-webkit-box-orient:vertical] sm:text-sm">
                    {current.diaryText}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                    {/* Home基準の色とアイコンを使用 */}
                    <span
                      className="rounded-full border px-3 py-1 text-[10px]"
                      style={{ backgroundColor: `${animal.accent}15`, color: animal.accent, borderColor: `${animal.accent}30` }}
                    >
                      {animal.emoji} {animal.label}
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] italic opacity-60">
                      # {current.emotion}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 補助ボタン */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-3">
              <button
                onClick={() => paginate(-1)}
                disabled={currentIndex === 0}
                className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-white/65 bg-white/65 text-[#4A443F] shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 active:scale-95"
                aria-label="前の思い出"
              >
                ←
              </button>
              <button
                onClick={() => paginate(1)}
                disabled={currentIndex === memories.length - 1}
                className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-white/65 bg-white/65 text-[#4A443F] shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 active:scale-95"
                aria-label="次の思い出"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 text-center font-serif text-[11px] tracking-[0.16em] text-[#4A443F]/45">
            {currentIndex + 1} / {memories.length} ページ
          </div>
        </div>

        <MemoryListPanel
          memories={memories}
          currentIndex={currentIndex}
          onSelect={selectMemory}
        />
      </div>
    </motion.div>
  );
}

function MemoryListPanel({
  memories,
  currentIndex,
  onSelect,
}: {
  memories: MemoryAlbumItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-white/45 bg-[#FAF9F6]/42 p-2.5 shadow-soft backdrop-blur-[14px]">
        <div className="mb-2.5 flex items-end justify-between px-1">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#8B7355]/55">
              INDEX
            </p>
            <h2 className="mt-0.5 text-xs font-semibold tracking-tight text-[#4A443F]/85">
              思い出一覧
            </h2>
          </div>
          <span className="rounded-full border border-[#D1C7B7]/55 bg-white/35 px-2 py-0.5 text-[9px] tabular-nums text-[#8B7355]/75">
            {memories.length}
          </span>
        </div>

        <div className="max-h-[56vh] space-y-1.5 overflow-y-auto pr-0.5">
          {memories.map((memory, index) => {
            const active = index === currentIndex;
            const animal = getMemoryAnimal(memory.animalId);
            return (
              <button
                key={memory.id}
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group grid w-full grid-cols-[3rem_minmax(0,1fr)] gap-2.5 rounded-xl border p-1.5 text-left transition-all",
                  active
                    ? "border-[#D1C7B7]/55 bg-white/58 shadow-ambient"
                    : "border-transparent bg-transparent opacity-72 hover:border-white/45 hover:bg-white/35 hover:opacity-100",
                )}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#E5D9C7] ring-1 ring-black/5">
                  <Image
                    src={memory.imageUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="60px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <time className="text-[9px] tabular-nums text-[#8B7355]/70">
                      {formatMemoryDate(memory.createdAt)}
                    </time>
                    {active && (
                      <span
                        className="h-1.5 w-1.5 rounded-full opacity-80"
                        style={{ background: animal.accent }}
                        aria-hidden
                      />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-[#4A443F]/88">
                    {memory.diaryText}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="rounded-full border px-1.5 py-0.5 text-[8px]"
                      style={{
                        backgroundColor: `${animal.accent}12`,
                        borderColor: `${animal.accent}28`,
                        color: animal.accent,
                      }}
                    >
                      {animal.emoji}
                    </span>
                    <span className="truncate text-[9px] text-[#8B7355]/65">
                      {memory.emotion}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
