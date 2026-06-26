"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Leaf,
  Send,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";

import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi, type TanzakuWish } from "@/lib/api/tanzaku";
import { pageTransition, cardStagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "achieved";

const wishIcons: ComponentType<{ className?: string; "aria-hidden"?: boolean }>[] = [
  Sparkles,
  Flower2,
  BookOpen,
  Sprout,
];

function formatMonth(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
}

function formatShortDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function completedSteps(item: TanzakuWish) {
  return item.steps.filter((step) => step.done).length;
}

function WishEmblem({
  icon: Icon,
  achieved,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  achieved: boolean;
}) {
  return (
    <div className="relative flex size-[5.5rem] shrink-0 items-center justify-center rounded-full border border-[#eadbc7] bg-[#fffaf1] shadow-[0_7px_20px_rgba(112,87,52,0.09),inset_0_0_0_5px_rgba(255,255,255,0.72)] max-sm:size-16">
      <span className="absolute inset-2 rounded-full border border-dashed border-[#d9bd8e]/65" />
      <Leaf className="absolute bottom-3 left-3 size-4 -rotate-[28deg] text-[#8d9b69]/75" aria-hidden />
      <Leaf className="absolute right-3 top-3 size-4 rotate-[145deg] text-[#8d9b69]/75" aria-hidden />
      <Icon
        className={cn(
          "relative z-10 size-9",
          achieved ? "text-[#8d9b69]" : "text-[#d6a251]",
        )}
        aria-hidden
      />
    </div>
  );
}

function StarTrail({ item }: { item: TanzakuWish }) {
  const total = Math.max(item.steps.length, 4);
  const done = item.status === "achieved" ? total : completedSteps(item);
  const visible = Math.min(Math.max(total, 4), 6);

  return (
    <div className="relative flex h-8 w-[15rem] items-center justify-between max-sm:w-[10.5rem]" aria-label={`${done} / ${total} ステップ完了`}>
      <span className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-[#d8ae6a] via-[#dfc38e] to-[#d8c5a4]" />
      {Array.from({ length: visible }, (_, index) => {
        const active = index < Math.ceil((done / total) * visible);
        return (
          <span key={index} className="relative z-10 bg-[#fffaf3] px-0.5">
            <Star
              className={cn(
                "size-5",
                active
                  ? "fill-[#c99a55] text-[#c99a55]"
                  : "fill-[#fffaf3] text-[#c7a978]",
              )}
              strokeWidth={1.4}
              aria-hidden
            />
          </span>
        );
      })}
    </div>
  );
}

function WishCard({ item, index }: { item: TanzakuWish; index: number }) {
  const Icon = wishIcons[index % wishIcons.length];
  const achieved = item.status === "achieved";

  return (
    <motion.div variants={cardStagger.item}>
      <Link
        href={`/tanzaku/past/${item.id}`}
        className="group grid min-h-[10.7rem] grid-cols-[auto_1fr_auto] items-center gap-6 rounded-[1.6rem] border border-[#e3d8ca]/90 bg-white/52 px-6 py-5 shadow-[0_9px_28px_rgba(93,72,46,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/68 max-sm:grid-cols-[auto_1fr] max-sm:gap-4 max-sm:px-4"
      >
        <WishEmblem icon={Icon} achieved={achieved} />

        <div className="min-w-0 self-stretch py-1">
          <div className="flex items-start justify-between gap-4">
            <p className="line-clamp-2 font-serif text-[1.28rem] font-semibold leading-[1.65] tracking-[0.03em] text-[#2f302d] max-sm:text-base">
              {item.dream}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 font-serif text-sm font-semibold",
                achieved
                  ? "bg-[#e9eee3] text-[#71805d]"
                  : "bg-[#fff0cf] text-[#c47d30]",
              )}
            >
              {achieved ? "叶った" : "挑戦中"}
            </span>
          </div>
          <p className="mt-2 font-serif text-sm tracking-[0.04em] text-[#666158]">
            {formatMonth(item.createdAt)}に送った願い
          </p>
          <div className="mt-3 flex justify-end">
            <StarTrail item={item} />
          </div>
        </div>

        <ChevronRight
          className="size-6 text-[#b78d52] transition-transform group-hover:translate-x-1 max-sm:hidden"
          strokeWidth={1.5}
          aria-hidden
        />
      </Link>
    </motion.div>
  );
}

export default function PastTanzakuPage() {
  const [items, setItems] = useState<TanzakuWish[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    tanzakuApi
      .list()
      .then(({ items: fetched }) => {
        if (!ignore) setItems(fetched);
      })
      .catch(() => {
        if (!ignore) setError("願いの軌跡を読み込めませんでした。");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => filter === "all" || item.status === filter),
    [filter, items],
  );

  const achievedCount = items.filter((item) => item.status === "achieved").length;
  const activeCount = items.length - achievedCount;
  const sortedRecentItems = [...items]
    .sort(
      (a, b) =>
        new Date(b.achievedAt ?? b.createdAt).getTime() -
        new Date(a.achievedAt ?? a.createdAt).getTime(),
    );
  const recentItems = showAllRecent ? sortedRecentItems : sortedRecentItems.slice(0, 4);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "すべて", count: items.length },
    { value: "active", label: "挑戦中", count: activeCount },
    { value: "achieved", label: "叶った", count: achievedCount },
  ];

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.main {...pageTransition} className="relative min-h-[calc(100vh-var(--nav-height))]">
        <div className="relative mx-auto min-h-screen w-full max-w-[59rem] overflow-hidden px-8 pb-14 pt-7 sm:px-16">
          <span className="noise-layer pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg,rgba(255,253,248,.94),rgba(250,243,232,.76) 48%,rgba(255,249,240,.94)),radial-gradient(circle at 15% 12%,rgba(241,207,145,.18),transparent 23%),radial-gradient(circle at 82% 35%,rgba(210,220,184,.18),transparent 26%)",
            }}
            aria-hidden
          />

          <div className="relative z-10">
            <header className="grid grid-cols-[3rem_1fr_3rem] items-center">
              <Link
                href="/tanzaku"
                aria-label="短冊を書くページへ戻る"
                className="flex size-12 items-center justify-center rounded-full border border-white/80 bg-white/45 text-[#615d55] shadow-[0_5px_18px_rgba(76,62,42,0.07),inset_0_1px_0_white] transition hover:bg-white/75"
              >
                <ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden />
              </Link>
              <p className="text-center font-serif text-xl tracking-[0.17em] text-[#88945f] max-sm:text-base">
                MEMORIA <span className="text-[#d38887]">wishes</span>
              </p>
              <span aria-hidden />
            </header>

            <section className="pb-10 pt-10 text-center max-sm:pt-8">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="size-5 text-[#d8a85e]" aria-hidden />
                <h1 className="font-serif text-[2.65rem] font-medium tracking-[0.16em] text-[#33332f] max-sm:text-3xl">
                  願いの軌跡
                </h1>
                <Sparkles className="size-5 text-[#d8a85e]" aria-hidden />
              </div>
              <p className="mt-4 font-serif text-[1.02rem] tracking-[0.16em] text-[#59564f] max-sm:text-sm max-sm:leading-7">
                これまでに送った願いを、星とともに振り返りましょう。
              </p>
            </section>

            <section className="grid grid-cols-2 divide-x divide-[#e0d6c7] rounded-[1.55rem] border border-[#e1d7c9] bg-white/48 px-10 py-6 shadow-[0_10px_30px_rgba(91,70,44,0.07),inset_0_1px_0_rgba(255,255,255,.9)] max-sm:px-3">
              <div className="flex items-center justify-center gap-5 max-sm:gap-3">
                <BookOpen className="size-12 text-[#a18f6d] max-sm:size-8" strokeWidth={1.3} aria-hidden />
                <div>
                  <p className="font-serif text-sm tracking-[0.16em] text-[#666158]">記録した願い</p>
                  <p className="mt-1 font-serif text-4xl tracking-[0.08em] text-[#393833] max-sm:text-3xl">
                    {items.length}<span className="ml-2 text-base">件</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-5 max-sm:gap-3">
                <Star className="size-12 text-[#d4a25a] max-sm:size-8" strokeWidth={1.2} aria-hidden />
                <div>
                  <p className="font-serif text-sm tracking-[0.16em] text-[#666158]">叶った願い</p>
                  <p className="mt-1 font-serif text-4xl tracking-[0.08em] text-[#393833] max-sm:text-3xl">
                    {achievedCount}<span className="ml-2 text-base">件</span>
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid grid-cols-3 rounded-full border border-[#e2d8ca] bg-white/48 px-3 shadow-[0_6px_20px_rgba(91,70,44,0.06),inset_0_1px_0_white]">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "relative py-4 font-serif text-base tracking-[0.12em] transition-colors max-sm:text-sm",
                    filter === option.value ? "text-[#738052]" : "text-[#5e5a53]",
                  )}
                >
                  {option.label}
                  <span className="ml-1 text-xs opacity-55">{option.count}</span>
                  {filter === option.value && (
                    <motion.span
                      layoutId="past-tanzaku-filter"
                      className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#8d9a61]"
                    />
                  )}
                </button>
              ))}
            </div>

            {loading && (
              <div className="mt-6 space-y-4">
                {[0, 1].map((item) => (
                  <div key={item} className="h-40 animate-pulse rounded-[1.6rem] border border-white/60 bg-white/35" />
                ))}
              </div>
            )}

            {error && (
              <p className="mt-6 rounded-2xl border border-[#e5caca] bg-[#fff6f3]/75 px-4 py-4 text-center text-sm text-[#9c5e58]">
                {error}
              </p>
            )}

            {!loading && !error && filteredItems.length === 0 && (
              <div className="mt-6 rounded-[1.6rem] border border-[#e2d8ca] bg-white/42 px-6 py-12 text-center">
                <Star className="mx-auto size-9 text-[#c9aa77]" strokeWidth={1.2} aria-hidden />
                <p className="mt-3 font-serif text-[#686259]">表示できる願いはまだありません</p>
              </div>
            )}

            {!loading && (
              <motion.div
                className="mt-6 flex flex-col gap-4"
                initial="initial"
                animate="animate"
                variants={cardStagger.container}
              >
                {filteredItems.map((item, index) => (
                  <WishCard key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            )}

            {recentItems.length > 0 && (
              <section className="mt-9">
                <div className="flex items-center gap-5">
                  <h2 className="shrink-0 font-serif text-xl tracking-[0.14em] text-[#4a4741]">最近の軌跡</h2>
                  <span className="h-px flex-1 bg-[#ded4c5]" />
                  {sortedRecentItems.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllRecent((current) => !current)}
                      className="flex shrink-0 items-center gap-1 font-serif text-sm text-[#6a655d] transition hover:text-[#596b3c]"
                    >
                      {showAllRecent ? "閉じる" : "すべて見る"}
                      <ChevronRight
                        className={cn(
                          "size-4 text-[#b58c53] transition-transform",
                          showAllRecent && "rotate-90",
                        )}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
                <div className="relative mt-7 grid grid-cols-4 gap-5 max-sm:grid-cols-2 max-sm:gap-y-8">
                  <span className="absolute left-[8%] right-[8%] top-5 border-t border-dashed border-[#d4b77f]/60 max-sm:hidden" />
                  {recentItems.map((item) => {
                    const achieved = item.status === "achieved";
                    return (
                      <Link key={item.id} href={`/tanzaku/past/${item.id}`} className="group relative z-10 text-center">
                        <span
                          className={cn(
                            "mx-auto flex size-11 items-center justify-center rounded-full border-4 border-[#fffaf2] shadow-[0_0_24px_currentColor]",
                            achieved ? "bg-[#91a27b] text-[#91a27b]" : "bg-[#d6a45a] text-[#d6a45a]",
                          )}
                        >
                          <Star className="size-5 fill-white text-white" aria-hidden />
                        </span>
                        <p className="mt-4 font-serif text-xs tracking-[0.08em] text-[#746f66]">
                          {formatShortDate(item.achievedAt ?? item.createdAt)}
                        </p>
                        <p className="mt-2 line-clamp-2 font-serif text-sm leading-6 text-[#4e4b45] transition-colors group-hover:text-[#788457]">
                          「{item.dream}」
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <Link
              href="/tanzaku?fresh=1"
              className="group mt-11 flex min-h-32 items-center gap-6 overflow-hidden rounded-[1.45rem] border border-[#e8d2c7] bg-[linear-gradient(100deg,rgba(255,249,239,.84),rgba(255,232,226,.74))] px-8 py-5 shadow-[0_8px_25px_rgba(108,73,53,.07),inset_0_1px_0_white] transition hover:-translate-y-0.5 max-sm:px-5"
            >
              <div className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-[#fff8ed] max-sm:size-14">
                <Flower2 className="size-11 text-[#d38c87] max-sm:size-8" strokeWidth={1.25} aria-hidden />
                <Leaf className="absolute -bottom-1 -right-1 size-7 text-[#8d9b69]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl tracking-[0.1em] text-[#ce7778] max-sm:text-base">新しい願いを送る</p>
                <p className="mt-2 font-serif text-sm tracking-[0.09em] text-[#666159] max-sm:text-xs">
                  未来の自分へ、そっと願いを届けましょう。
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d9c4b7] bg-white/45 text-[#a47d63] transition-transform group-hover:translate-x-1 max-sm:size-9">
                <Send className="size-5" strokeWidth={1.4} aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </motion.main>
    </>
  );
}
