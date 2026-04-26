"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { cn } from "@/lib/utils";

const dreamTitle = "自分の言葉で誰かの心を動かせる人になる";
const progressPct = 42;

const steps: {
  title: string;
  status: "done" | "current" | "upcoming";
  detail?: string;
  dateLine: string;
}[] = [
  {
    title: "自分の得意・好きなことを整理する",
    status: "done",
    dateLine: "2025/05/10 完了",
  },
  {
    title: "毎日10分、文章を書く習慣をつくる",
    status: "current",
    detail: "細則：日記やメモでOK",
    dateLine: "期限：2025/06/30",
  },
  {
    title: "誰かに自分の文章を読んでもらう",
    status: "upcoming",
    dateLine: "期限：2025/08/31",
  },
  {
    title: "フィードバックをもとに表現を整える",
    status: "upcoming",
    dateLine: "期限：2025/10/31",
  },
  {
    title: "大切な人に「心に残る言葉」を贈る",
    status: "upcoming",
    dateLine: "期限：2026/12/31",
  },
];

function KebabMenu() {
  return (
    <button
      type="button"
      className="flex size-9 items-center justify-center rounded-full text-foreground/55 transition-colors hover:bg-foreground/[0.06] hover:text-foreground/90"
      aria-label="メニュー"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    </button>
  );
}

export default function RoadmapPage() {
  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader title="" showBack rightAction={<KebabMenu />} />

        <div className="mx-auto w-full max-w-md px-5 pb-10 pt-2">
          <h1 className="text-balance text-left text-2xl font-bold leading-snug tracking-tight text-mono-ink">
            {dreamTitle}
          </h1>

          <div className="mt-7">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
              進捗
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-mono-cream/90 ring-1 ring-mono-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-primary shadow-sm"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="shrink-0 text-xl font-bold tabular-nums text-mono-ink">
                {progressPct}%
              </span>
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
            {steps.map((step, i) => (
              <motion.div key={i} variants={cardStagger.item}>
                <GlassCard
                  className={cn(
                    "p-4",
                    step.status === "current" &&
                      "border-mono-sand/45 bg-gradient-to-br from-mono-sand/30 to-mono-cream/25",
                    step.status !== "current" &&
                      "border-white/45 bg-mono-paper/55",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {step.status === "done" ? (
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary shadow-sm ring-2 ring-white/50">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12l4 4L20 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-7 rounded-full border-2 border-mono-ink/18 bg-mono-paper/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={cn(
                          "text-[15px] font-semibold leading-snug text-mono-ink",
                          step.status === "done" && "text-foreground/78",
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
                        {step.dateLine}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
