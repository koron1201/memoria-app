"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { GlassCard } from "@/components/glass-card";
import { MoodAnimal } from "@/components/mood-animal";
import {
  ANIMALS,
  DEFAULT_ANIMAL_ID,
  getAnimal,
  type AnimalId,
} from "@/lib/mood";
import { cardStagger, pageTransition, transitions } from "@/lib/motion";

interface Memory {
  id: string;
  date: string;
  animalId: AnimalId;
  preview: string;
}

const recentMemories: Memory[] = [
  {
    id: "1",
    date: "4月15日",
    animalId: "free",
    preview: "公園で出会った猫と過ごした午後。風が気持ちよかった。",
  },
  {
    id: "2",
    date: "4月14日",
    animalId: "calm",
    preview: "本を読みながら、静かに一杯のコーヒー。窓越しの光が柔らかかった。",
  },
  {
    id: "3",
    date: "4月13日",
    animalId: "curious",
    preview: "気になっていた路地裏のカフェを探検。新しい香りに出会った。",
  },
  {
    id: "4",
    date: "4月11日",
    animalId: "friendly",
    preview: "駅前で偶然の再会。短い立ち話でも心があたたまった。",
  },
];

function formatToday() {
  const d = new Date();
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${week}曜日`;
}

// TODO: 思い出一覧ルート（/memory or /memories）が確定したら差し替える
const ALL_MEMORIES_HREF = "/profile";

export default function Home() {
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
        transition={transitions.gentle}
        style={{
          background: `radial-gradient(90% 60% at 50% 12%, ${heroAnimal.accent}2e 0%, transparent 62%)`,
        }}
      />

      <AppHeader date={today} eyebrow="Today" />

      {/* 3カラム：lg 以上で左4 / 中央5 / 右3、未満はスタック（中央→思い出→図鑑） */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-5 pt-4 lg:grid-cols-12 lg:gap-8 lg:pt-6">
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
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]">
        {/* 地面のソフトシャドウ */}
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 h-5 w-56 -translate-x-1/2 rounded-[50%] opacity-60 blur-xl transition-colors duration-700"
          style={{ background: `${heroAnimal.accent}66` }}
        />

        {/* パルスリング（未タップ時のみ） */}
        <AnimatePresence>
          {!tapped && (
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
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground/70">
            Today&apos;s companion
          </p>
          <h1 className="mt-1.5 inline-flex items-center gap-2 text-[28px] font-bold leading-tight text-foreground">
            <span aria-hidden>{heroAnimal.emoji}</span>
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
            <p className="mt-2 max-w-xs text-xs text-muted-foreground/90">
              <span
                className="mr-1.5 font-semibold tracking-wider"
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
                <motion.span
                  className="size-1.5 rounded-full"
                  style={{
                    background: heroAnimal.accent,
                    boxShadow: `0 0 10px ${heroAnimal.accent}`,
                  }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
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
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">最近の思い出</h2>
        <Link
          href={ALL_MEMORIES_HREF}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          すべて見る →
        </Link>
      </div>

      <motion.div
        className="mt-3 flex flex-col gap-2.5"
        initial="initial"
        animate="animate"
        variants={cardStagger.container}
      >
        {memories.map((m, idx) => (
          <motion.div key={m.id} variants={cardStagger.item}>
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
      <GlassCard
        className={`relative overflow-hidden p-0 transition-all ${
          isHero
            ? "scale-[1.01] bg-white/75"
            : "bg-white/45 hover:scale-[1.005] hover:bg-white/60"
        }`}
      >
        {/* 主役カード：左端のアクセントバー + 極薄グロー */}
        {isHero && (
          <>
            <span
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{
                background: `linear-gradient(180deg, ${animal.accent} 0%, ${animal.accent}44 100%)`,
              }}
            />
            <span
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(120% 80% at 0% 50%, ${animal.accent}33 0%, transparent 55%)`,
              }}
            />
          </>
        )}

        <div className="relative flex items-stretch">
          <div
            className="relative flex w-20 shrink-0 items-center justify-center text-3xl"
            style={{
              background: `linear-gradient(180deg, ${animal.accent}44 0%, ${animal.accent}0f 100%)`,
            }}
          >
            <span aria-hidden>{animal.emoji}</span>
          </div>

          <div className="min-w-0 flex-1 p-3.5">
            <div className="flex items-center gap-1.5">
              {isLatest && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white"
                  style={{ background: animal.accent }}
                >
                  Today
                </span>
              )}
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
                {memory.date}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold leading-tight">
              {animal.label}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {memory.preview}
            </p>
          </div>

          <div className="flex items-center pr-3 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5">
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
      </GlassCard>
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
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">動物図鑑</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Catalog
        </span>
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
