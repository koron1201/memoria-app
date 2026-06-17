"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  MoreHorizontal,
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
          eyebrow="思い出アルバム"
          title={formattedDate}
          page="MEMORIA album"
          action={
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/"
                className="grid size-10 place-items-center rounded-full bg-white/45 text-mono-ink ring-1 ring-mono-ink/8 transition hover:bg-white/75"
                aria-label="ホームへ戻る"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full bg-white/45 text-mono-ink ring-1 ring-mono-ink/8"
                aria-label="その他"
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
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
      <div className="relative mx-auto aspect-[1.58/1] min-h-[24rem] w-full overflow-hidden rounded-[0.55rem] border-[8px] border-[#d5c9b7]/80 bg-[#f9f5eb] shadow-elev ring-1 ring-mono-ink/8 max-lg:aspect-auto max-lg:min-h-0">
        <div
          className="pointer-events-none absolute inset-y-4 left-1/2 z-20 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-mono-ink/12 to-transparent"
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
            className="grid h-full grid-cols-1 lg:grid-cols-2"
          >
            <div className="relative flex min-h-[22rem] items-center justify-center border-mono-linen/50 bg-[#fbf8f0] p-6 shadow-[inset_-12px_0_18px_-18px_rgba(58,56,52,0.55)] lg:border-r lg:p-10">
              <Polaroid current={current} />
            </div>

            <article className="flex min-h-[22rem] flex-col justify-center bg-[#fbf8f0] px-7 py-8 font-serif text-mono-ink sm:px-10 lg:px-14">
              <time className="border-b border-mono-linen/60 pb-2 text-[11px] tracking-[0.14em] text-muted-foreground">
                {formatMemoryDate(current.createdAt)}
              </time>
              <p className="mt-5 whitespace-pre-line text-sm leading-[2.1] text-mono-ink/88">
                {current.diaryText}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${animal.accent}16`,
                    borderColor: `${animal.accent}34`,
                    color: animal.accent,
                  }}
                >
                  {animal.emoji} {animal.label}
                </span>
                <span className="rounded-full bg-white/65 px-3 py-1 text-[11px] text-mono-ink/70 ring-1 ring-mono-ink/6">
                  # {current.emotion}
                </span>
              </div>
            </article>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="absolute left-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/78 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur disabled:opacity-0"
        aria-label="前の思い出"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="absolute right-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/78 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur disabled:opacity-0"
        aria-label="次の思い出"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
      <Link
        href={`/memory/${current.id}`}
        className="absolute right-2 top-[57%] z-30 grid size-11 place-items-center rounded-full bg-white/86 text-mono-ink shadow-soft ring-1 ring-mono-ink/8 backdrop-blur"
        aria-label="思い出を編集する"
      >
        <Pencil className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function Polaroid({ current }: { current: MemoryAlbumItem }) {
  return (
    <div className="relative w-full max-w-[21rem] rotate-[-1.5deg] bg-white p-3 pb-14 shadow-elev ring-1 ring-mono-ink/8">
      <WashiTape className="-top-4 left-16" />
      <div className="relative aspect-[1.08/1] overflow-hidden bg-mono-cream">
        <Image src={current.imageUrl} alt="" fill className="object-cover" sizes="360px" unoptimized />
      </div>
      <p className="mt-5 px-3 font-serif text-lg leading-relaxed text-mono-ink">
        {current.diaryText.slice(0, 28)}
        {current.diaryText.length > 28 ? "..." : ""}
      </p>
      <div className="absolute bottom-4 right-6 text-3xl text-[#edb7a2]" aria-hidden>
        ❀
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
