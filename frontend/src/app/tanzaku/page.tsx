"use client";

import { useState } from "react";
import Link from "next/link";

import { DEFAULT_ROADMAP_HREF } from "@/lib/app-paths";
import { PAST_TANZAKU_ITEMS } from "@/lib/past-tanzaku";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";

const MAX_LEN = 40;
const PAST_COUNT = PAST_TANZAKU_ITEMS.length;

function formatDateJp(ymd: string) {
  const d = new Date(ymd + "T12:00:00");
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TanzakuPage() {
  const [dream, setDream] = useState(
    "自分の言葉で誰かの心を動かせる人になりたい",
  );
  const [deadline, setDeadline] = useState("2026-12-31");
  const dateInputId = "tanzaku-deadline";

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader
          title="夢を短冊に書いてみよう"
          subline="あなたの願いが、未来の一歩になります。"
          showBack
        />

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 px-5 pt-1 pb-10">
          <div className="relative w-full py-2">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[#d4a574]/18 blur-3xl"
              aria-hidden
            />

            <div className="relative mx-auto flex w-full max-w-[13.5rem] flex-col items-center">
              <div
                className="relative mb-0 flex w-full flex-col items-center"
                style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
              >
                <div
                  className="mb-0 flex h-5 w-10 items-end justify-center"
                  aria-hidden
                >
                  <div
                    className="h-4 w-4 rounded-b-full border border-rose-300/90 border-t-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #fecaca55 0%, #fda4af88 100%)",
                    }}
                  />
                </div>
                <div
                  className="relative w-full overflow-hidden rounded-2xl border border-amber-900/8 bg-gradient-to-b from-[#fffcf4] to-[#f0e4d2] px-3 pb-3 pt-3 shadow-elev [box-shadow:inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="mx-auto h-1 w-7 rounded-b-full bg-[#8b6b4a]/15" />
                  <div className="relative mt-3 flex min-h-[15.5rem] w-full items-center justify-center px-1">
                    <textarea
                      value={dream}
                      onChange={(e) =>
                        setDream(
                          e.target.value.slice(0, MAX_LEN),
                        )
                      }
                      maxLength={MAX_LEN}
                      spellCheck={false}
                      rows={1}
                      className="tanzaku-vertical-input max-h-full min-h-0 resize-none self-center overflow-y-auto bg-transparent p-0 text-xl font-semibold leading-[2] tracking-wide text-[#3d3730] placeholder:text-[#8b7355]/35 focus:outline-none sm:text-[1.35rem] sm:leading-[2.1]"
                      placeholder="夢を"
                    />
                    <span className="pointer-events-none absolute bottom-1.5 right-1 text-[10px] tabular-nums text-[#8b7355]/70">
                      {dream.length}/{MAX_LEN}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <p className="text-xs font-medium text-foreground/75" id={`${dateInputId}-label`}>
              期限（任意）
            </p>
            <label
              htmlFor={dateInputId}
              className="mt-1.5 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-mono-ink/10 bg-mono-paper/95 py-2.5 pl-3.5 pr-3 text-left text-sm text-foreground shadow-ambient [box-shadow:inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <span className="min-w-0 flex-1 tabular-nums">
                {formatDateJp(deadline)}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="shrink-0 text-muted-foreground/75"
                aria-hidden
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
              <input
                id={dateInputId}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="sr-only"
                aria-labelledby={`${dateInputId}-label`}
              />
            </label>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              type="button"
              variant="brand"
              className="h-12 w-full text-base font-medium"
              size="lg"
              disabled={!dream.trim()}
            >
              短冊を送る
            </Button>
            <div className="flex w-full flex-col gap-2.5 text-center text-sm">
              <Link
                href={DEFAULT_ROADMAP_HREF}
                className="text-primary/95 font-medium underline-offset-2 hover:underline"
              >
                ロードマップを見る
              </Link>
              <Link
                href="/tanzaku/past"
                className="text-primary/80 underline-offset-2 hover:underline"
              >
                過去の短冊を見る（{PAST_COUNT}枚）
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
