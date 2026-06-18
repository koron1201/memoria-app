"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BookOpen, ChevronRight, Grid2X2, Map, PenLine, Sparkles, Star } from "lucide-react";
import { MoodAnimal } from "@/components/mood-animal";
import {
  DottedDivider,
  NotebookHeader,
  NotebookSectionTitle,
  NotebookSheet,
  NotebookSideTabs,
} from "@/components/notebook-shell";
import {
  ANIMALS,
  DEFAULT_ANIMAL_ID,
  getAnimal,
  type AnimalId,
} from "@/lib/mood";
import { toHomeMemory, type MemoryRecord } from "@/lib/memory-records";
import type { SampleMemory } from "@/lib/sample-memories";
import { pageTransition } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useOnboarding } from "./hooks/useOnboarding";

type Memory = SampleMemory;

const EMOTION_CHIP: Record<AnimalId, { label: string; className: string }> = {
  free: { label: "喜び", className: "bg-[#eaa0ad]/75 text-[#704651]" },
  calm: { label: "落ち着き", className: "bg-mono-sage/25 text-mono-ink" },
  curious: { label: "探究", className: "bg-[#f3d46f]/75 text-[#6c5b28]" },
  lonely: { label: "そっと", className: "bg-mono-linen/35 text-mono-ink" },
  friendly: { label: "親しみ", className: "bg-[#eaa0ad]/65 text-[#704651]" },
  social: { label: "ふれあい", className: "bg-mono-sage/30 text-mono-ink" },
};

function formatToday() {
  const d = new Date();
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日・${week}曜日`;
}

export default function Home() {
  const { isChecking } = useOnboarding();
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [selectedCatalogId, setSelectedCatalogId] = useState<AnimalId>(DEFAULT_ANIMAL_ID);
  const [today] = useState(() => formatToday());

  useEffect(() => {
    let cancelled = false;

    async function fetchMemories() {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (cancelled) return;

        if (!error && data) {
          const next = (data as MemoryRecord[]).map(toHomeMemory);
          setRecentMemories(next);
          if (next[0]) setSelectedCatalogId(next[0].animalId);
        } else {
          setRecentMemories([]);
        }
      } catch {
        if (!cancelled) setRecentMemories([]);
      } finally {
        if (!cancelled) setIsLoadingMemories(false);
      }
    }
    fetchMemories();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredMemory = recentMemories[0] ?? null;
  const featuredAnimal = useMemo(
    () => getAnimal(featuredMemory?.animalId ?? selectedCatalogId),
    [featuredMemory, selectedCatalogId],
  );
  const selectedAnimal = useMemo(() => getAnimal(selectedCatalogId), [selectedCatalogId]);

  if (isChecking) return null;

  return (
    <motion.main {...pageTransition} className="relative min-h-[calc(100vh-var(--nav-height))]">
      <NotebookSheet maxWidth="max-w-[58rem]">
        <NotebookSideTabs active="home" />
        <FlowerFieldBackdrop />
        <div className="relative z-10">
          <NotebookHeader
            eyebrow="今日のあなた"
            title="MEMORIA"
            page={today}
            action={
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  aria-label="通知"
                  className="grid size-9 place-items-center rounded-full bg-white/40 text-mono-ink ring-1 ring-mono-ink/8 transition hover:bg-white/65"
                >
                  <Bell className="size-4" aria-hidden />
                </button>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/15 transition hover:bg-white/75"
                >
                  <PenLine className="size-4" aria-hidden />
                  日記を書く
                </Link>
              </div>
            }
          />

          <FeaturedPage memory={featuredMemory} animal={featuredAnimal} loading={isLoadingMemories} />

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-6">
              <section className="rounded-[1rem] border border-mono-linen/30 bg-white/64 p-4 shadow-soft ring-1 ring-white/45 backdrop-blur-[2px] sm:p-5">
                <div className="mb-3 flex items-start gap-3">
                  <NotebookSectionTitle
                    number="01"
                    label="MEMORIES"
                    title="最近の思い出"
                    icon={BookOpen}
                    className="mb-0 flex-1"
                  />
                  <Link
                    href="/memory"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-primary ring-1 ring-primary/12 transition hover:bg-white/90"
                  >
                    すべて見る
                    <ChevronRight className="size-3" aria-hidden />
                  </Link>
                </div>
                <div className="space-y-3">
                  {isLoadingMemories && (
                    <p className="rounded-[1rem] bg-white/45 px-4 py-5 text-sm text-muted-foreground ring-1 ring-mono-ink/6">
                      思い出を読み込んでいます...
                    </p>
                  )}
                  {!isLoadingMemories && recentMemories.length === 0 && (
                    <p className="rounded-[1rem] bg-white/45 px-4 py-5 text-sm text-muted-foreground ring-1 ring-mono-ink/6">
                      まだ思い出が記録されていません。
                    </p>
                  )}
                  {recentMemories.map((memory, index) => (
                    <MemoryListCard key={memory.id} memory={memory} latest={index === 0} />
                  ))}
                </div>
              </section>

              <DreamRoadmapCard />
            </div>

            <div className="grid gap-6 xl:translate-x-3">
              <section>
                <NotebookSectionTitle number="02" label="CATALOG" title="動物図鑑" icon={Grid2X2} />
                <div className="grid grid-cols-3 gap-3">
                  {ANIMALS.map((animal) => {
                    const active = animal.id === selectedCatalogId;
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => setSelectedCatalogId(animal.id)}
                        className={cn(
                          "flex min-h-[5.7rem] flex-col items-center justify-center gap-1 rounded-[0.8rem] bg-white/50 px-2 py-3 text-center shadow-ambient ring-1 ring-mono-ink/6 transition hover:-translate-y-0.5 hover:bg-white/70",
                          active && "bg-white/80 ring-primary/35",
                        )}
                        aria-pressed={active}
                      >
                        <span className="text-2xl" aria-hidden>
                          {animal.emoji}
                        </span>
                        <span className="text-[11px] font-semibold leading-tight text-mono-ink">
                          {animal.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <PartnerCard animal={selectedAnimal} />
            </div>
          </div>

        </div>
      </NotebookSheet>
    </motion.main>
  );
}

function FlowerFieldBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-[-9rem] right-[-8rem] z-0 h-[24rem] w-[min(58rem,112%)] bg-cover bg-bottom bg-no-repeat opacity-90"
      style={{
        backgroundImage: "url('/home-assets/flower-field-bg.png')",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 24%, rgba(0,0,0,0.62) 58%, black 100%)",
        maskImage:
          "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 24%, rgba(0,0,0,0.62) 58%, black 100%)",
      }}
    />
  );
}

function FeaturedPage({
  memory,
  animal,
  loading,
}: {
  memory: Memory | null;
  animal: ReturnType<typeof getAnimal>;
  loading: boolean;
}) {
  const tags = memory
    ? [EMOTION_CHIP[memory.animalId].label, memory.tags[0], memory.tags[1]].filter(Boolean)
    : ["書び", "楽しい", "喜び"];

  return (
    <Link
      href={memory ? `/memory/${memory.id}` : "/upload"}
      className="group mt-7 block rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative overflow-hidden rounded-[1.35rem] border border-mono-linen/30 bg-[#fffdf6]/62 px-5 py-5 shadow-soft ring-1 ring-white/45 backdrop-blur-sm sm:px-7">
        <div className="absolute right-3 top-3 text-3xl text-[#f1b6b9]" aria-hidden>
          ✿
        </div>
        <div className="absolute bottom-3 right-5 text-5xl text-mono-sage/25" aria-hidden>
          ❀
        </div>
        <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground">
          <span className="h-5 w-1 rounded-full bg-[#e9d59d]" aria-hidden />
          いまの1ページ
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-[38rem] text-[1.02rem] font-semibold leading-loose text-mono-ink">
            {loading
              ? "今日の思い出を読み込んでいます..."
              : memory?.preview ??
                "まだ今日の1ページは白紙です。写真とひとことから、MEMORIAが思い出を綴ります。"}
          </p>
          <span className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-white/65 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/12 sm:justify-self-end">
            {animal.emoji} {animal.label}
            <ChevronRight className="size-3" aria-hidden />
          </span>
        </div>
        <DottedDivider className="my-4" />
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-black/5",
                index === 0
                  ? EMOTION_CHIP[animal.id].className
                  : index === 1
                    ? "bg-[#f3d46f]/65 text-[#6c5b28]"
                    : "bg-mono-sage/25 text-mono-ink",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function MemoryListCard({ memory, latest }: { memory: Memory; latest: boolean }) {
  return (
    <Link
      href={`/memory/${memory.id}`}
      className="grid grid-cols-[5.6rem_1fr_auto] items-center gap-3 rounded-[1rem] bg-white/54 p-2.5 shadow-ambient ring-1 ring-mono-ink/6 transition hover:-translate-y-0.5 hover:bg-white/76"
    >
      <div className="relative aspect-square overflow-hidden rounded-[0.75rem] bg-mono-cream ring-1 ring-mono-ink/8">
        <Image src={memory.imageUrl} alt="" fill sizes="96px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {latest && (
            <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-primary-foreground">
              NEW
            </span>
          )}
          <time className="text-[12px] tabular-nums text-muted-foreground">{memory.date}</time>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-mono-ink">
          {memory.listTitle}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {memory.tags.slice(0, 2).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full bg-mono-cream/65 px-2.5 py-0.5 text-[10px] text-mono-ink/75 ring-1 ring-mono-ink/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}

function DreamRoadmapCard() {
  return (
    <section>
      <NotebookSectionTitle number="03" label="ROADMAP" title="夢のロードマップ" icon={Map} />
      <Link
        href="/roadmap"
        className="group block rounded-[1rem] bg-[#fff3c7]/82 p-5 shadow-soft ring-1 ring-[#d8ba72]/24 transition hover:-translate-y-0.5 hover:bg-[#fff6d8]"
      >
        <div className="flex items-start gap-3 pr-10">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/58 text-[#d4a43d] ring-1 ring-[#d8ba72]/18">
            <Star className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground">
              次の夢
            </p>
            <p className="mt-1 text-base font-semibold leading-relaxed text-mono-ink">
              温泉旅行へ行く
            </p>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-mono-ink/70">
            <span>達成率</span>
            <span className="tabular-nums">65%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/78 ring-1 ring-mono-ink/8">
            <div className="h-full w-[65%] rounded-full bg-mono-sage" />
          </div>
          <span
            aria-hidden
            className="absolute -right-1 -top-7 text-4xl leading-none text-mono-sage/55"
          >
            ♨
          </span>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          ロードマップを見る
          <ChevronRight className="size-3" aria-hidden />
        </p>
        <span className="sr-only">夢のロードマップを見る</span>
      </Link>
    </section>
  );
}

function PartnerCard({ animal }: { animal: ReturnType<typeof getAnimal> }) {
  const [actionTick, setActionTick] = useState(0);

  return (
    <section className="rounded-[1rem] border border-mono-linen/30 bg-white/55 p-5 shadow-soft ring-1 ring-white/45">
      <NotebookSectionTitle title="今日の相棒" icon={Sparkles} className="mb-1" />
      <div className="grid gap-4 sm:grid-cols-[1fr_9.75rem] sm:items-center lg:grid-cols-[1fr_9.5rem]">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-mono-ink">
            {animal.label}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {animal.tagline}
          </p>
          <Link
            href="/animal-card/default"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            動物図鑑を見る
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="relative h-36 w-36 justify-self-center sm:translate-x-2 sm:justify-self-end lg:translate-x-3">
          <MoodAnimal
            src={animal.glb}
            accent={animal.accent}
            className="absolute inset-0 h-36 w-full"
            actionTick={actionTick}
            onInteract={() => setActionTick((tick) => tick + 1)}
          />
        </div>
      </div>
    </section>
  );
}
