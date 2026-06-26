"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Pencil,
} from "lucide-react";
import {
  DottedDivider,
  NotebookHeader,
  NotebookSectionTitle,
  NotebookSheet,
  NotebookSideTabs,
  WashiTape,
} from "@/components/notebook-shell";
import { pageTransition, transitions } from "@/lib/motion";
import { toAlbumMemory, type MemoryAlbumItem, type MemoryAnimalId } from "@/lib/memory-records";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export interface MemoryAnimal {
  id: MemoryAnimalId;
  label: string;
  emoji: string;
  accent: string;
}

const MEMORY_ANIMALS: MemoryAnimal[] = [
  { id: "lion", label: "情熱的なライオン", emoji: "🦁", accent: "#D4847A" },
  { id: "rabbit", label: "思慮深いウサギ", emoji: "🐰", accent: "#C9A87C" },
  { id: "cat", label: "自由っぽいネコ", emoji: "🐱", accent: "#9BB5A5" },
  { id: "bear", label: "穏やかなクマ", emoji: "🐻", accent: "#6B8F7A" },
  { id: "fox", label: "好奇心旺盛なキツネ", emoji: "🦊", accent: "#C4B59A" },
];

export function getMemoryAnimal(id: MemoryAnimalId): MemoryAnimal {
  return MEMORY_ANIMALS.find((a) => a.id === id) ?? MEMORY_ANIMALS[2];
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

function formatShortDate(createdAt: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt;
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${week})`;
}

function getPolaroidMotto(memory: MemoryAlbumItem) {
  const text = `${memory.diaryText} ${memory.emotion}`;

  if (/(カフェ|読書|本|静寂|安らぎ|穏やか|光)/.test(text)) {
    return "静かなひとときは、心の宝物。";
  }
  if (/(友|家族|会話|笑|一緒|再会|つなが)/.test(text)) {
    return "笑い合う時間が、いちばんの贈りもの。";
  }
  if (/(海|空|山|森|花|自然|風|景色|散歩)/.test(text)) {
    return "風にふれた心は、少し軽くなる。";
  }
  if (/(挑戦|頑張|できた|達成|勇気|成長)/.test(text)) {
    return "小さな一歩も、未来を照らす。";
  }
  if (/(寂|涙|不安|迷|疲|悲)/.test(text)) {
    return "弱い日も、やさしく抱きしめていい。";
  }

  return "小さな今日が、明日の宝物。";
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

  const current = memories[currentIndex] ?? null;
  const animal = current ? getMemoryAnimal(current.animalId) : getMemoryAnimal("cat");
  const formattedDate = current ? formatMemoryDate(current.createdAt) : "MEMORIA";

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
    <motion.main {...pageTransition} className="relative min-h-[calc(100vh-var(--nav-height))]">
      <NotebookSheet maxWidth="max-w-[76rem]">
        <NotebookSideTabs active="memory" />
        <NotebookHeader
          eyebrow="Every feeling shapes you."
          title={formattedDate}
          action={
            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-mono-ink ring-1 ring-mono-ink/8"
              >
                <Bookmark className="size-4" aria-hidden />
                しおりに追加
              </button>
            </div>
          }
        />

        {loading && <EmptyState text="アルバムを開いています..." />}
        {!loading && memories.length === 0 && <EmptyState text="まだ思い出が記録されていません。" />}

        {!loading && current && (
          <>
            <div className="mt-8">
              <OpenBook
                current={current}
                animal={animal}
                currentIndex={currentIndex}
                direction={direction}
                total={memories.length}
                onPrev={() => paginate(-1)}
                onNext={() => paginate(1)}
              />
            </div>

            <div className="mt-8 border-t border-mono-linen/45 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <NotebookSectionTitle title="思い出一覧" icon={Grid2X2} className="mb-0" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-white/50 px-4 py-2 text-[12px] font-semibold text-mono-ink ring-1 ring-mono-ink/8"
                  >
                    新しい順
                  </button>
                  <div className="rounded-full bg-white/45 p-1 ring-1 ring-mono-ink/8">
                    <Grid2X2 className="size-4 text-primary" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {memories.map((memory, index) => (
                  <MemoryThumb
                    key={memory.id}
                    memory={memory}
                    active={index === currentIndex}
                    latest={index === 0}
                    onSelect={() => selectMemory(index)}
                  />
                ))}
              </div>

              <div className="mt-5 flex justify-center">
                <div className="inline-flex items-center gap-8 rounded-full bg-white/52 px-7 py-2 text-sm text-mono-ink ring-1 ring-mono-ink/8">
                  <button
                    type="button"
                    onClick={() => paginate(-1)}
                    disabled={currentIndex === 0}
                    className="disabled:opacity-30"
                    aria-label="前のページ"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <span className="tabular-nums">
                    {currentIndex + 1} / {memories.length} ページ
                  </span>
                  <button
                    type="button"
                    onClick={() => paginate(1)}
                    disabled={currentIndex === memories.length - 1}
                    className="disabled:opacity-30"
                    aria-label="次のページ"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </NotebookSheet>
    </motion.main>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-8 rounded-[1.2rem] border border-mono-linen/35 bg-white/50 px-5 py-16 text-center font-serif text-sm text-muted-foreground shadow-soft">
      {text}
    </div>
  );
}

function OpenBook({
  current,
  animal,
  currentIndex,
  direction,
  total,
  onPrev,
  onNext,
}: {
  current: MemoryAlbumItem;
  animal: MemoryAnimal;
  currentIndex: number;
  direction: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-6 bottom-[-18px] h-14 rounded-[50%] bg-mono-ink/16 blur-2xl" aria-hidden />
      <div className="relative mx-auto w-full overflow-hidden rounded-[0.45rem] border border-[#d8cab7] bg-[#ded2bf] p-1 shadow-[0_28px_70px_rgba(58,49,38,0.18),0_8px_24px_rgba(58,49,38,0.10)] ring-1 ring-white/55">
        <div className="pointer-events-none absolute inset-x-2 top-1 h-3 rounded-t-[0.35rem] bg-white/35" aria-hidden />
        <div className="pointer-events-none absolute inset-x-3 bottom-1 h-2 rounded-b-[0.35rem] bg-mono-ink/8" aria-hidden />
        <div className="relative overflow-hidden rounded-[0.32rem] bg-[#f8f1e4] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-10px_24px_rgba(91,75,52,0.08)]">
          <span className="noise-layer pointer-events-none absolute inset-0 z-10" aria-hidden />
          <span
            className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-16 -translate-x-1/2 lg:block"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(86,70,48,0.08) 28%, rgba(255,255,255,0.34) 48%, rgba(65,50,36,0.16) 52%, rgba(86,70,48,0.08) 72%, transparent 100%)",
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-6 left-1/2 z-30 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-mono-ink/20 to-transparent lg:block"
            aria-hidden
          />
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 90 : -90, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -90 : 90, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitions.gentle}
            className="grid min-h-[38rem] grid-cols-1 lg:grid-cols-2"
          >
            <div
              className="relative flex min-h-[25rem] items-center justify-center overflow-hidden border-b border-[#d9cbb7]/70 bg-[#fbf5e9] px-6 py-9 shadow-[inset_-28px_0_34px_-34px_rgba(58,49,38,0.72)] sm:px-9 lg:min-h-[38rem] lg:border-b-0 lg:border-r lg:px-12"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(74,60,42,0.035) 0.7px, transparent 0.7px), linear-gradient(90deg, rgba(255,255,255,0.5), transparent 28%, rgba(99,78,52,0.035) 100%)",
                backgroundSize: "15px 15px, 100% 100%",
              }}
            >
              <Polaroid current={current} />
            </div>

            <article
              className="relative flex min-h-[25rem] flex-col bg-[#fbf5e9] px-8 py-10 font-serif text-mono-ink shadow-[inset_28px_0_34px_-34px_rgba(58,49,38,0.72)] sm:px-12 lg:min-h-[38rem] lg:px-16 lg:py-16"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(74,60,42,0.03) 0.7px, transparent 0.7px)",
                backgroundSize: "15px 15px",
              }}
            >
              <time className="w-full border-b border-[#d8c9b2]/70 pb-3 text-[10px] tracking-[0.12em] text-muted-foreground">
                {formatMemoryDate(current.createdAt)}
              </time>
              <p
                className="mt-7 max-w-[31rem] whitespace-pre-line pb-px text-[13px] leading-[2.15rem] text-mono-ink/84"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent 0 calc(2.15rem - 1px), rgba(146,120,84,0.18) calc(2.15rem - 1px) 2.15rem)",
                }}
              >
                {current.diaryText}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-10">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  style={{
                    backgroundColor: `${animal.accent}16`,
                    borderColor: `${animal.accent}34`,
                    color: animal.accent,
                  }}
                >
                  {animal.emoji} {animal.label}
                </span>
                <span className="rounded-full bg-white/58 px-3 py-1 text-[10px] text-mono-ink/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] ring-1 ring-mono-ink/5">
                  # {current.emotion}
                </span>
              </div>
            </article>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="absolute left-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/82 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur disabled:opacity-0"
        aria-label="前の思い出"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="absolute right-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/82 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur disabled:opacity-0"
        aria-label="次の思い出"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
      <Link
        href={`/memory/${current.id}`}
        className="absolute right-[-0.45rem] top-[57%] z-30 grid size-11 place-items-center rounded-full bg-white/90 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur"
        aria-label="思い出を編集する"
      >
        <Pencil className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function Polaroid({ current }: { current: MemoryAlbumItem }) {
  const motto = getPolaroidMotto(current);

  return (
    <div className="relative w-full max-w-[22rem] rotate-[-1.4deg] bg-[#fffdf8] p-3 pb-16 shadow-[0_18px_32px_rgba(58,49,38,0.14),0_3px_8px_rgba(58,49,38,0.08)] ring-1 ring-mono-ink/8">
      <WashiTape className="-top-4 left-14 h-7 w-20 opacity-80" />
      <span className="noise-layer pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative aspect-[1.06/1] overflow-hidden bg-mono-cream shadow-[inset_0_0_0_1px_rgba(58,49,38,0.05)]">
        <Image src={current.imageUrl} alt="" fill className="object-cover" sizes="360px" unoptimized />
      </div>
      <p className="mx-auto mt-5 max-w-[17.5rem] text-center font-serif text-[1.02rem] font-semibold leading-relaxed text-mono-ink/86">
        <span className="mb-1 block text-[10px] font-sans font-bold tracking-[0.18em] text-[#d998a8]">
          MEMORY WORDS
        </span>
        <span className="relative inline-block px-2">
          <span className="absolute -left-1 top-0 text-[#e9b7a2]" aria-hidden>
            “
          </span>
          {motto}
          <span className="absolute -right-1 bottom-0 text-[#e9b7a2]" aria-hidden>
            ”
          </span>
        </span>
      </p>
      <div className="absolute bottom-4 right-6 flex items-end gap-1.5 text-[#e5a695]" aria-hidden>
        <span className="text-2xl leading-none">❀</span>
        <span className="text-lg leading-none opacity-80">✿</span>
        <span className="text-xl leading-none text-[#d9c76f]">✤</span>
      </div>
    </div>
  );
}

function MemoryThumb({
  memory,
  active,
  latest,
  onSelect,
}: {
  memory: MemoryAlbumItem;
  active: boolean;
  latest: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-[8.6rem] shrink-0 rounded-[1rem] bg-white/55 p-2 text-left shadow-ambient ring-1 ring-mono-ink/7 transition hover:-translate-y-0.5 hover:bg-white/75",
        active && "ring-2 ring-primary/55",
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-[0.75rem] bg-mono-cream">
        <Image src={memory.imageUrl} alt="" fill sizes="140px" className="object-cover" unoptimized />
      </div>
      <div className="mt-2 flex items-center gap-2">
        {latest && (
          <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">
            NEW
          </span>
        )}
        <time className="text-[10px] text-muted-foreground">{formatShortDate(memory.createdAt)}</time>
      </div>
      <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-mono-ink">
        {memory.diaryText}
      </p>
      <DottedDivider className="mt-2" />
      <span className="mt-2 inline-block rounded-full bg-mono-cream/70 px-2 py-0.5 text-[10px] text-mono-ink/70">
        {memory.emotion}
      </span>
    </button>
  );
}
