"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { GlassCard } from "@/components/glass-card";
import { MoodAnimal } from "@/components/mood-animal";
import {
  ANIMALS,
  DEFAULT_ANIMAL_ID,
  getAnimal,
  type AnimalId,
} from "@/lib/mood";
import type { SampleMemory } from "@/lib/sample-memories";
import { SAMPLE_MEMORIES } from "@/lib/sample-memories";
import { cardStagger, pageTransition, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useOnboarding } from "./hooks/useOnboarding";

const EMOTION_CHIP: Record<
  AnimalId,
  { label: string; chip: "chip-moss" | "chip-sage" | "chip-sand" | "chip-blush" | "chip-linen" }
> = {
  free: { label: "喜び", chip: "chip-moss" },
  calm: { label: "落ち着き", chip: "chip-sage" },
  curious: { label: "探究", chip: "chip-sand" },
  lonely: { label: "そっと", chip: "chip-linen" },
  friendly: { label: "つながり", chip: "chip-blush" },
  social: { label: "ふれあい", chip: "chip-moss" },
};

type Memory = SampleMemory;

const recentMemories: Memory[] = SAMPLE_MEMORIES;

function formatToday() {
  const d = new Date();
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${week}曜日`;
}

const ALL_MEMORIES_HREF = "/memory";

function FeaturedStory({ memory, tags }: { memory: Memory; tags: string[] }) {
  const animal = getAnimal(memory.animalId);
  return (
    <Link
      href={`/memory/${memory.id}`}
      className="group block rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-sage/45"
    >
      <div className="relative min-h-[10.5rem] overflow-hidden rounded-[1.75rem] shadow-elev ring-1 ring-white/45">
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-rose-50/50 to-cyan-100/40 transition-transform duration-[1.1s] ease-out group-hover:scale-[1.015]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-mono-ink/28 via-mono-ink/6 to-white/5"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.5),transparent_58%)] opacity-90 mix-blend-overlay"
          aria-hidden
        />

        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/50 bg-mono-ink/8 px-2.5 py-1 text-[10px] font-medium text-mono-ink/85 shadow-ambient backdrop-blur-md">
          <span className="text-[12px] leading-none" aria-hidden>
            📷
          </span>
          <span className="tabular-nums tracking-wide">{memory.date}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4">
          <div className="rounded-2xl border border-white/40 bg-white/18 px-3.5 py-3 shadow-soft [box-shadow:inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[20px]">
            <p className="text-[10px] font-medium tracking-[0.18em] text-mono-ink/65">
              いまの1ページ
            </p>
            <div className="mt-1.5 flex items-start gap-2">
              <span
                aria-hidden
                className="mt-0.5 inline-block h-7 w-1 shrink-0 rounded-full"
                style={{ background: animal.accent }}
              />
              <p className="min-w-0 text-sm font-semibold leading-relaxed text-mono-ink/95 [text-shadow:0_1px_0_rgba(255,255,255,0.4)] line-clamp-2">
                {memory.preview}
              </p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/50 bg-white/35 px-2.5 py-0.5 text-[10px] font-medium text-mono-ink/90 backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { isChecking } = useOnboarding();
  if (isChecking) {
    return null;
  }

  const reduceMotion = useReducedMotion();
  // 主役決定用のメモリーID（既定: 最新 = recentMemories[0]）
  const [heroMemoryId, setHeroMemoryId] = useState<string | null>(
    recentMemories[0]?.id ?? null,
  );
  // 右図鑑で詳細を見ている動物（中央には影響しない）
  const [selectedCatalogId, setSelectedCatalogId] = useState<AnimalId>(
    recentMemories[0]?.animalId ?? DEFAULT_ANIMAL_ID,
  );
  const [actionTick, setActionTick] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [today] = useState(() => formatToday());

  const heroMemory = useMemo(
    () => recentMemories.find((m) => m.id === heroMemoryId) ?? null,
    [heroMemoryId],
  );
  const heroAnimal = useMemo(
    () => getAnimal(heroMemory?.animalId ?? DEFAULT_ANIMAL_ID),
    [heroMemory],
  );
  const selectedAnimal = useMemo(
    () => getAnimal(selectedCatalogId),
    [selectedCatalogId],
  );

  const handleInteract = () => {
    setActionTick((c) => c + 1);
    if (!tapped) setTapped(true);
  };

  const handlePickMemory = (id: string) => {
    if (id === heroMemoryId) {
      handleInteract();
      return;
    }
    setHeroMemoryId(id);
    setTapped(false);
    setActionTick(0);
  };

  return (
    <motion.div className="relative" {...pageTransition}>
      {/* ホーム限定：主役アニマルの accent に追従する上層ウォッシュ
          （全体背景は AppBackground が -z-50 に敷いている） */}
      <motion.div
        key={`bg-${heroAnimal.id}`}
        className="pointer-events-none fixed inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : transitions.gentle}
        style={{
          background: `radial-gradient(94% 62% at 50% 11%, color-mix(in oklab, ${heroAnimal.accent} 15%, transparent) 0%, transparent 64%),
            radial-gradient(128% 88% at 50% 0%, color-mix(in oklab, ${heroAnimal.accent} 6.5%, transparent) 0%, transparent 50%)`,
        }}
      />

      <AppHeader date={today} eyebrow="今日のあなた" />

      {heroMemory && (
        <div className="mx-auto w-full max-w-6xl px-5 pt-3 lg:pt-5">
          <FeaturedStory
            memory={heroMemory}
            tags={[
              EMOTION_CHIP[heroMemory.animalId].label,
              heroMemory.tags[0],
              heroMemory.tags[1],
            ]}
          />
        </div>
      )}

      {/* 3カラム：lg 以上で左4 / 中央5 / 右3、未満はスタック（中央→思い出→図鑑） */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-5 pt-4 lg:grid-cols-12 lg:gap-8 lg:pt-5">
        {/* ---------- 中央：主役3D ---------- */}
        <section className="order-1 flex flex-col items-center lg:order-2 lg:col-span-5">
          <HeroColumn
            heroAnimal={heroAnimal}
            heroMemory={heroMemory}
            tapped={tapped}
            actionTick={actionTick}
            onInteract={handleInteract}
          />
        </section>

        {/* ---------- 左：思い出リスト ---------- */}
        <section className="order-2 lg:order-1 lg:col-span-4">
          <MemoriesColumn
            memories={recentMemories}
            heroMemoryId={heroMemoryId}
            onPick={handlePickMemory}
          />
        </section>

        {/* ---------- 右：動物図鑑 ---------- */}
        <section className="order-3 lg:col-span-3">
          <CatalogColumn
            selected={selectedAnimal}
            selectedId={selectedCatalogId}
            heroId={heroAnimal.id}
            onSelect={setSelectedCatalogId}
          />
        </section>
      </div>

    </motion.div>
  );
}

/* =========================================================
 * Hero (center)
 * =======================================================*/
function HeroColumn({
  heroAnimal,
  heroMemory,
  tapped,
  actionTick,
  onInteract,
}: {
  heroAnimal: ReturnType<typeof getAnimal>;
  heroMemory: Memory | null;
  tapped: boolean;
  actionTick: number;
  onInteract: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    setClientReady(true);
  }, []);
  const showPulseRings = clientReady && !tapped && !reduceMotion;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]">
        {/* 地面のソフトシャドウ */}
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 h-5 w-56 -translate-x-1/2 rounded-[50%] opacity-60 blur-xl transition-colors duration-700"
          style={{ background: `${heroAnimal.accent}66` }}
        />

        {/* パルスリング（水合後のみ。prefers-reduced-motion は CSR で確定するため SSR 不一致を防ぐ） */}
        <AnimatePresence>
          {showPulseRings && (
            <>
              <motion.span
                key="ring-1"
                className="pointer-events-none absolute rounded-full border"
                style={{
                  width: "88%",
                  height: "88%",
                  borderColor: `${heroAnimal.accent}55`,
                }}
                initial={{ opacity: 0 }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0, 0.55] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.span
                key="ring-2"
                className="pointer-events-none absolute rounded-full border"
                style={{
                  width: "96%",
                  height: "96%",
                  borderColor: `${heroAnimal.accent}33`,
                }}
                initial={{ opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0, 0.35] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.7,
                }}
              />
            </>
          )}
        </AnimatePresence>

        <MoodAnimal
          src={heroAnimal.glb}
          accent={heroAnimal.accent}
          className="relative z-10 h-72 w-72 sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]"
          actionTick={actionTick}
          onInteract={onInteract}
        />
      </div>

      {/* キャプション：ラベル → 主役名 → 下線 → タグライン → タップヒント */}
      <AnimatePresence mode="wait">
        <motion.div
          key={heroAnimal.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitions.default}
          className="mt-3 flex flex-col items-center text-center"
        >
          <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground/75">
            今日の相棒
          </p>
          <h1 className="mt-1.5 inline-flex items-center gap-2.5 text-2xl font-bold leading-tight text-foreground">
            <span
              aria-hidden
              className="inline-block h-8 w-1.5 shrink-0 rounded-full"
              style={{ background: heroAnimal.accent }}
            />
            <span>{heroAnimal.label}</span>
          </h1>
          <span
            className="mt-1.5 h-[3px] w-10 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${heroAnimal.accent} 0%, ${heroAnimal.accent}00 100%)`,
            }}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {heroAnimal.tagline}
          </p>

          {/* 日付 + プレビュー（1行） */}
          {heroMemory && (
            <p className="mt-2 max-w-xs text-xs text-[color:var(--muted-foreground-elevated)]">
              <span
                className="mr-1.5 font-semibold tabular-nums tracking-wider"
                style={{ color: heroAnimal.accent }}
              >
                {heroMemory.date}
              </span>
              <span className="line-clamp-1 align-middle">
                {heroMemory.preview}
              </span>
            </p>
          )}

          <AnimatePresence mode="wait">
            {!tapped ? (
              <motion.span
                key="hint-first"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.default}
                className="shadow-ambient mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/55 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur"
              >
                {reduceMotion ? (
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: heroAnimal.accent }}
                    aria-hidden
                  />
                ) : (
                  <motion.span
                    className="size-1.5 rounded-full"
                    style={{
                      background: heroAnimal.accent,
                      boxShadow: `0 0 10px ${heroAnimal.accent}`,
                    }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                タップしてあいさつ
              </motion.span>
            ) : (
              <motion.span
                key="hint-retap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={transitions.default}
                className="mt-3 inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                aria-hidden
              >
                <span
                  className="size-1 rounded-full"
                  style={{ background: heroAnimal.accent }}
                />
                もう一度タップで反応
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * Memories (left)
 * =======================================================*/
function MemoriesColumn({
  memories,
  heroMemoryId,
  onPick,
}: {
  memories: Memory[];
  heroMemoryId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-primary/80">
          01
        </span>
        <span className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground/70">
          Memories
        </span>
        <span
          aria-hidden
          className="ml-1 h-px min-w-0 flex-1"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 100%)",
          }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">直近の思い出</h2>
        <Link
          href={ALL_MEMORIES_HREF}
          className="text-xs text-[color:var(--muted-foreground-elevated)] transition-colors hover:text-foreground"
        >
          すべて見る
        </Link>
      </div>

      <motion.div
        className="mt-2 flex flex-col divide-y divide-foreground/8"
        initial="initial"
        animate="animate"
        variants={cardStagger.container}
      >
        {memories.map((m, idx) => (
          <motion.div key={m.id} className="pt-2.5 first:pt-0" variants={cardStagger.item}>
            <MemoryCard
              memory={m}
              isHero={m.id === heroMemoryId}
              isLatest={idx === 0}
              onPick={onPick}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function MemoryCard({
  memory,
  isHero,
  isLatest,
  onPick,
}: {
  memory: Memory;
  isHero: boolean;
  isLatest: boolean;
  onPick: (id: string) => void;
}) {
  const animal = getAnimal(memory.animalId);
  return (
    <button
      type="button"
      onClick={() => onPick(memory.id)}
      aria-pressed={isHero}
      className="group block w-full text-left"
    >
      <div
        className={cn(
          "relative flex gap-3 rounded-xl px-0.5 py-1 transition-all",
          isHero &&
            "bg-gradient-to-r from-primary/[0.08] to-transparent ring-1 ring-primary/20",
        )}
      >
        {isHero && (
          <span
            className="absolute bottom-0 left-0 top-0 w-[2px] rounded-full"
            style={{ background: animal.accent }}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-mono-ink/10",
            isLatest && "ring-2",
          )}
          style={isLatest ? { boxShadow: `0 0 0 1px ${animal.accent}55` } : undefined}
        >
          <Image
            src={memory.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="72px"
          />
        </div>
        <div className="min-w-0 flex-1 pr-0.5 pt-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {isLatest && (
              <span
                className="rounded px-1 py-0.5 text-[8px] font-bold tracking-widest text-white"
                style={{ background: animal.accent }}
              >
                NEW
              </span>
            )}
            <time className="text-[12px] font-medium tabular-nums text-muted-foreground">
              {memory.date}
            </time>
            <span className="min-w-0 text-sm font-semibold leading-snug text-foreground">
              {memory.listTitle}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {memory.meta != null && memory.meta !== "" && (
              <span className="text-[10px] tabular-nums text-muted-foreground/85">
                {memory.meta}
              </span>
            )}
            {memory.tags.map((t) => (
              <span
                key={t}
                className="inline-flex rounded-full border border-amber-900/14 bg-mono-cream/55 px-2 py-0.5 text-[10px] font-medium text-[#4a3f34]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
 * Catalog (right) — 閲覧専用・中央には影響しない
 * =======================================================*/
function CatalogColumn({
  selected,
  selectedId,
  heroId,
  onSelect,
}: {
  selected: ReturnType<typeof getAnimal>;
  selectedId: AnimalId;
  heroId: AnimalId;
  onSelect: (id: AnimalId) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none lg:sticky lg:top-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-primary/80">
          02
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground/70">
          Catalog
        </span>
        <span
          aria-hidden
          className="ml-1 h-px min-w-0 flex-1"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 100%)",
          }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">動物図鑑</h2>
      </div>

      {/* チップグリッド 3×2 */}
      <div
        className="shadow-soft mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/50 bg-white/45 p-2 backdrop-blur-xl"
        role="listbox"
        aria-label="動物を選択"
      >
        {ANIMALS.map((a) => {
          const active = a.id === selectedId;
          const isHero = a.id === heroId;
          return (
            <button
              key={a.id}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={a.label}
              onClick={() => {
                onSelect(a.id);
                setExpanded(false);
              }}
              className={`relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] transition-transform active:scale-95 ${
                active ? "scale-[1.03]" : "opacity-75 hover:opacity-100"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${a.accent}cc, ${a.accent}44)`,
                      boxShadow: `0 10px 22px ${a.accent}55, inset 0 0 0 1px rgba(255,255,255,0.55)`,
                    }
                  : { background: "transparent" }
              }
            >
              <span className="text-2xl leading-none" aria-hidden>
                {a.emoji}
              </span>
              <span className="font-medium text-muted-foreground">
                {a.label}
              </span>
              {/* 主役バッジ */}
              {isHero && (
                <span
                  className="absolute right-1 top-1 size-1.5 rounded-full"
                  style={{
                    background: a.accent,
                    boxShadow: `0 0 6px ${a.accent}`,
                  }}
                  aria-label="主役"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 選択中の詳細パネル */}
      <GlassCard className="mt-3 p-4" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {selected.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight">
                  {selected.label}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {selected.tagline}
                </p>
              </div>
            </div>

            <div
              className="my-3 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${selected.accent}55, transparent)`,
              }}
            />

            <p
              className={`text-xs leading-relaxed text-foreground/85 ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {selected.description}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-[11px] font-medium transition-colors"
              style={{ color: selected.accent }}
            >
              {expanded ? "閉じる" : "もっと見る →"}
            </button>
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      {heroId !== selectedId && (
        <p className="mt-2 px-1 text-[10px] leading-relaxed text-muted-foreground/70">
          図鑑は閲覧専用です。主役を変えるには左の思い出をタップ。
        </p>
      )}
    </div>
  );
}
