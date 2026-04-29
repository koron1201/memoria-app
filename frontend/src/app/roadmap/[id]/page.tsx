"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { cn } from "@/lib/utils";

const dreamTitle = "自分の言葉で誰かの心を動かせる人になる";

type Step = {
  title: string;
  done: boolean;
  detail?: string;
  dateLine: string;
};

const initialSteps: Step[] = [
  {
    title: "自分の得意・好きなことを整理する",
    done: true,
    dateLine: "2025/05/10 完了",
  },
  {
    title: "毎日10分、文章を書く習慣をつくる",
    done: false,
    detail: "細則：日記やメモでOK",
    dateLine: "期限：2025/06/30",
  },
  {
    title: "誰かに自分の文章を読んでもらう",
    done: false,
    dateLine: "期限：2025/08/31",
  },
  {
    title: "フィードバックをもとに表現を整える",
    done: false,
    dateLine: "期限：2025/10/31",
  },
  {
    title: "大切な人に「心に残る言葉」を贈る",
    done: false,
    dateLine: "期限：2026/12/31",
  },
];

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
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-white/55 bg-white/35 text-mono-ink/55 shadow-ambient transition-colors hover:bg-white/70 hover:text-mono-ink"
          aria-label="メニュー"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function CelebrationOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-mono-ink/18 px-6 backdrop-blur-[5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/70 bg-mono-paper/88 p-6 text-center shadow-elev"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(212,165,116,0.32),transparent_68%)]" />
            <motion.div
              className="mx-auto grid size-16 place-content-center rounded-full bg-primary text-3xl text-white shadow-elev"
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              ✓
            </motion.div>
            <h2 className="mt-5 text-xl font-bold text-mono-ink">
              願いが叶いました
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ここまで積み重ねた一歩が、ちゃんと形になりました。次の願いも、短冊から始めましょう。
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function moveStep(steps: Step[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= steps.length) return steps;
  const next = [...steps];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const [showCelebration, setShowCelebration] = useState(false);
  const doneCount = steps.filter((step) => step.done).length;
  const progressPct = useMemo(
    () => Math.round((doneCount / steps.length) * 100),
    [doneCount, steps.length],
  );

  const toggleStep = (index: number) => {
    setSteps((current) => {
      const next = current.map((step, i) =>
        i === index
          ? {
              ...step,
              done: !step.done,
            }
          : step,
      );
      if (!showCelebration && next.every((step) => step.done)) {
        setShowCelebration(true);
        window.setTimeout(() => {
          router.push("/tanzaku?fresh=1");
        }, 2800);
      }
      return next;
    });
  };

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <RoadmapHeader />
        <CelebrationOverlay show={showCelebration} />

        <div className="mx-auto w-full max-w-md px-5 pb-10 pt-5">
          <div className="rounded-[1.5rem] border border-white/55 bg-mono-paper/58 p-5 shadow-soft backdrop-blur-[18px]">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-primary/75">
              WISH
            </p>
            <h1 className="mt-2 text-balance text-left text-2xl font-bold leading-snug tracking-tight text-mono-ink">
              {dreamTitle}
            </h1>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between">
              <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
                進捗
              </p>
              <p className="text-[10px] text-muted-foreground">
                完了 {doneCount}/{steps.length}
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
          </div>

          <p className="mb-2.5 mt-8 text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
            ステップ
          </p>

          <motion.div
            className="space-y-2.5"
            initial="initial"
            animate="animate"
            variants={cardStagger.container}
          >
            {steps.map((step, i) => {
              const current = !step.done && steps.findIndex((s) => !s.done) === i;
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
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l4 4L20 7" />
                            </svg>
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
                        {step.detail && (
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {step.detail}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs tabular-nums text-muted-foreground/90">
                          {step.done && !step.dateLine.includes("完了")
                            ? `${step.dateLine} 完了`
                            : step.dateLine}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setSteps((currentSteps) => moveStep(currentSteps, i, -1))}
                          disabled={i === 0}
                          className="flex size-7 items-center justify-center rounded-full bg-white/45 text-mono-ink/55 transition-colors hover:bg-white/75 disabled:opacity-25"
                          aria-label="上へ移動"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => setSteps((currentSteps) => moveStep(currentSteps, i, 1))}
                          disabled={i === steps.length - 1}
                          className="flex size-7 items-center justify-center rounded-full bg-white/45 text-mono-ink/55 transition-colors hover:bg-white/75 disabled:opacity-25"
                          aria-label="下へ移動"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
