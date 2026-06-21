"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { pageTransition, transitions } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi, type TanzakuWish } from "@/lib/api/tanzaku";
import { cn } from "@/lib/utils";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TanzakuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<TanzakuWish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    tanzakuApi
      .get(id)
      .then((wish) => {
        if (!ignore) setItem(wish);
      })
      .catch(() => {
        if (!ignore) setItem(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        短冊を読み込んでいます
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        短冊が見つかりません
      </div>
    );
  }

  const achieved = item.status === "achieved";
  const doneCount = item.steps.filter((step) => step.done).length;

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader title="短冊" showBack />

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-5 pt-2 pb-10">
          <div className="relative w-full py-2">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[#d4a574]/15 blur-3xl"
              aria-hidden
            />

            <div className="relative mx-auto flex w-full max-w-[14rem] flex-col items-center">
              <div
                className="relative flex w-full flex-col items-center"
                style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
              >
                <div className="mb-0 flex h-5 w-10 items-end justify-center" aria-hidden>
                  <div
                    className="h-4 w-4 rounded-b-full border border-rose-300/90 border-t-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #fecaca55 0%, #fda4af88 100%)",
                    }}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.gentle}
                  className="relative w-full overflow-hidden rounded-2xl border border-amber-900/8 bg-gradient-to-b from-[#fffcf4] to-[#f0e4d2] px-4 pb-6 pt-4 shadow-elev [box-shadow:inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="mx-auto h-1 w-7 rounded-b-full bg-[#8b6b4a]/15" />

                  <div className="mt-4 flex min-h-[16rem] w-full items-center justify-center px-1">
                    <p
                      className="max-h-full text-xl font-semibold leading-[2.2] tracking-wide text-[#3d3730] sm:text-[1.35rem] sm:leading-[2.1]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {item.dream}
                    </p>
                  </div>

                  <p className="mt-3 text-center text-xs text-[#8b7355]/80">
                    {formatDate(item.createdAt)}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.2 }}
            className="w-full"
          >
            <div
              className={cn(
                "rounded-2xl border p-5 backdrop-blur-md",
                achieved
                  ? "border-emerald-300/40 bg-gradient-to-br from-emerald-50/60 via-white/50 to-amber-50/30 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
                  : "border-amber-300/30 bg-gradient-to-br from-amber-50/50 via-white/50 to-orange-50/20 shadow-[0_8px_32px_rgba(245,158,11,0.06)]",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    achieved
                      ? "bg-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                      : "bg-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.25)]",
                  )}
                >
                  {achieved ? (
                    <Check className="size-6 text-white" aria-hidden />
                  ) : (
                    <span className="text-lg font-bold text-white">{doneCount}</span>
                  )}
                </div>
                <div>
                  <h2
                    className={cn(
                      "text-base font-bold",
                      achieved ? "text-emerald-700" : "text-amber-700",
                    )}
                  >
                    {achieved ? "願いが叶いました" : "挑戦中"}
                  </h2>
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    進捗: {doneCount}/{item.steps.length}
                    {item.achievedAt ? ` / 達成日: ${formatDate(item.achievedAt)}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/50 bg-white/45 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground/70">
                  {achieved ? "達成した感想" : "現在のロードマップ"}
                </p>
                {achieved && item.reflection ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {item.reflection}
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {item.steps.map((step, index) => (
                      <div key={`${step.title}-${index}`} className="flex gap-2 text-sm">
                        <span className={cn("mt-0.5 size-4 rounded-full border", step.done ? "border-emerald-500 bg-emerald-500" : "border-mono-ink/20")} />
                        <p className="min-w-0 flex-1 leading-relaxed text-foreground/90">
                          {step.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <Link
              href={`/roadmap/${item.id}`}
              className="text-sm font-medium text-primary/90 underline-offset-4 hover:underline"
            >
              ロードマップを見る
            </Link>
            <Link
              href="/tanzaku/past"
              className="text-sm font-medium text-primary/80 underline-offset-4 hover:underline"
            >
              過去の短冊一覧に戻る
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
