"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, MoreHorizontal } from "lucide-react";

import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition, cardStagger } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi, type TanzakuStep, type TanzakuWish } from "@/lib/api/tanzaku";
import { cn } from "@/lib/utils";

function formatDate(ymd: string) {
  if (!ymd) return "期限未設定";
  const date = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return ymd;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function RoadmapHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-white/35 bg-mono-paper/50 backdrop-blur-[18px]">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full border border-white/55 bg-white/45 text-mono-ink/75 shadow-ambient transition-colors hover:bg-white/70 hover:text-mono-ink"
          aria-label="戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-primary/75">
            DREAM MAP
          </p>
          <p className="mt-0.5 text-sm font-bold tracking-tight text-mono-ink">
            ロードマップ
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full border border-white/55 bg-white/35 text-mono-ink/55 shadow-ambient">
          <MoreHorizontal className="size-4" aria-hidden />
        </div>
      </div>
    </header>
  );
}

function moveStep(steps: TanzakuStep[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= steps.length) return steps;
  const next = [...steps];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export default function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [wish, setWish] = useState<TanzakuWish | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSteps, setSavingSteps] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    tanzakuApi
      .get(id)
      .then((item) => {
        if (ignore) return;
        setWish(item);
        setReflection(item.reflection ?? "");
      })
      .catch(() => {
        if (!ignore) setError("ロードマップを読み込めませんでした。");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const doneCount = wish?.steps.filter((step) => step.done).length ?? 0;
  const progressPct = useMemo(() => {
    if (!wish?.steps.length) return 0;
    return Math.round((doneCount / wish.steps.length) * 100);
  }, [doneCount, wish?.steps.length]);

  const saveSteps = async (steps: TanzakuStep[]) => {
    if (!wish) return;
    setSavingSteps(true);
    setError(null);
    const optimistic = { ...wish, steps };
    setWish(optimistic);
    try {
      const saved = await tanzakuApi.update(wish.id, { steps });
      setWish(saved);
      setReflection(saved.reflection ?? "");
    } catch {
      setWish(wish);
      setError("進捗を保存できませんでした。");
    } finally {
      setSavingSteps(false);
    }
  };

  const toggleStep = (index: number) => {
    if (!wish) return;
    const steps = wish.steps.map((step, i) =>
      i === index
        ? {
            ...step,
            done: !step.done,
            completedAt: !step.done ? new Date().toISOString() : null,
          }
        : step,
    );
    void saveSteps(steps);
  };

  const saveReflection = async () => {
    if (!wish || progressPct < 100) return;
    setSavingReflection(true);
    setError(null);
    try {
      const saved = await tanzakuApi.update(wish.id, {
        steps: wish.steps,
        reflection,
      });
      setWish(saved);
      setReflection(saved.reflection ?? "");
      router.push(`/tanzaku/past/${saved.id}`);
    } catch {
      setError("達成した感想を保存できませんでした。");
    } finally {
      setSavingReflection(false);
    }
  };

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <RoadmapHeader />

        <div className="mx-auto w-full max-w-md px-5 pb-10 pt-5">
          {loading && (
            <p className="rounded-3xl border border-white/55 bg-mono-paper/58 p-5 text-center text-sm text-muted-foreground shadow-soft">
              ロードマップを読み込んでいます
            </p>
          )}

          {!loading && !wish && (
            <p className="rounded-3xl border border-white/55 bg-mono-paper/58 p-5 text-center text-sm text-muted-foreground shadow-soft">
              ロードマップが見つかりません
            </p>
          )}

          {wish && (
            <>
              <div className="rounded-[1.5rem] border border-white/55 bg-mono-paper/58 p-5 shadow-soft backdrop-blur-[18px]">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-primary/75">
                  WISH
                </p>
                <h1 className="mt-2 text-balance text-left text-2xl font-bold leading-snug tracking-tight text-mono-ink">
                  {wish.dream}
                </h1>
                {wish.deadline && (
                  <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                    最終期限：{formatDate(wish.deadline)}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
                    進捗
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    完了 {doneCount}/{wish.steps.length}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-mono-cream/90 ring-1 ring-mono-ink/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-primary shadow-sm"
                      initial={false}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                  <motion.span
                    key={progressPct}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="shrink-0 text-xl font-bold tabular-nums text-mono-ink"
                  >
                    {progressPct}%
                  </motion.span>
                </div>
                {savingSteps && (
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">
                    保存中
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-2xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              )}

              <p className="mb-2.5 mt-8 text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
                ステップ
              </p>

              <motion.div
                className="space-y-2.5"
                initial="initial"
                animate="animate"
                variants={cardStagger.container}
              >
                {wish.steps.map((step, i) => {
                  const current = !step.done && wish.steps.findIndex((s) => !s.done) === i;
                  return (
                    <motion.div key={`${step.title}-${i}`} layout variants={cardStagger.item}>
                      <GlassCard
                        className={cn(
                          "p-4",
                          current &&
                            "border-mono-sand/45 bg-gradient-to-br from-mono-sand/30 to-mono-cream/25",
                          step.done && "border-white/45 bg-mono-paper/55",
                          !current && !step.done && "border-white/35 bg-mono-paper/45",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleStep(i)}
                            className="mt-0.5 shrink-0"
                            aria-label={step.done ? "未完了に戻す" : "完了にする"}
                          >
                            {step.done ? (
                              <div className="flex size-7 items-center justify-center rounded-full bg-primary shadow-sm ring-2 ring-white/50">
                                <Check className="size-4 text-white" aria-hidden />
                              </div>
                            ) : (
                              <div className="size-7 rounded-full border-2 border-mono-ink/18 bg-mono-paper/60 transition-colors hover:border-primary/45" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1 text-left">
                            <p
                              className={cn(
                                "text-[15px] font-semibold leading-snug text-mono-ink",
                                step.done && "text-foreground/72",
                              )}
                            >
                              {step.title}
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                              {step.detail}
                            </p>
                            <p className="mt-1.5 text-xs tabular-nums text-muted-foreground/90">
                              {step.done && step.completedAt
                                ? `${new Date(step.completedAt).toLocaleDateString("ja-JP")} 完了`
                                : `期限：${formatDate(step.dueDate)}`}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => saveSteps(moveStep(wish.steps, i, -1))}
                              disabled={i === 0 || savingSteps}
                              className="flex size-7 items-center justify-center rounded-full bg-white/45 text-mono-ink/55 transition-colors hover:bg-white/75 disabled:opacity-25"
                              aria-label="上へ移動"
                            >
                              <ArrowUp className="size-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveSteps(moveStep(wish.steps, i, 1))}
                              disabled={i === wish.steps.length - 1 || savingSteps}
                              className="flex size-7 items-center justify-center rounded-full bg-white/45 text-mono-ink/55 transition-colors hover:bg-white/75 disabled:opacity-25"
                              aria-label="下へ移動"
                            >
                              <ArrowDown className="size-3.5" aria-hidden />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>

              <AnimatePresence>
                {progressPct === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-6 rounded-[1.5rem] border border-emerald-200/60 bg-emerald-50/70 p-5 shadow-soft"
                  >
                    <h2 className="text-base font-bold text-emerald-800">
                      達成した感想
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-800/75">
                      叶った瞬間の気持ちを残すと、過去の短冊からいつでも見返せます。
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      rows={4}
                      maxLength={600}
                      className="mt-4 w-full resize-none rounded-2xl border border-emerald-200/70 bg-white/75 px-3 py-3 text-sm leading-relaxed text-mono-ink outline-none focus:border-emerald-400"
                      placeholder="ここまで進めて感じたことを書く"
                    />
                    <Button
                      type="button"
                      variant="brand"
                      className="mt-3 h-11 w-full"
                      disabled={savingReflection}
                      onClick={saveReflection}
                    >
                      {savingReflection ? "保存中" : "感想を保存する"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
