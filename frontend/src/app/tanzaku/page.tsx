"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi } from "@/lib/api/tanzaku";

const MAX_LEN = 40;

function formatDateJp(ymd: string) {
  const d = new Date(ymd + "T12:00:00");
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TanzakuPage() {
  const router = useRouter();
  const [dream, setDream] = useState(() => {
    if (typeof window === "undefined") {
      return "自分の言葉で誰かの心を動かせる人になりたい";
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("fresh") === "1"
      ? ""
      : "自分の言葉で誰かの心を動かせる人になりたい";
  });
  const [deadline, setDeadline] = useState("2026-12-31");
  const [isSending, setIsSending] = useState(false);
  const [pastCount, setPastCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date("2026-12-01T12:00:00"));

  useEffect(() => {
    let ignore = false;
    tanzakuApi
      .list()
      .then(({ items }) => {
        if (!ignore) setPastCount(items.length);
      })
      .catch(() => {
        if (!ignore) setPastCount(0);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  const moveCalendarMonth = (offset: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectDate = (date: Date) => {
    setDeadline(toYmd(date));
    setCalendarOpen(false);
  };

  const sendTanzaku = async () => {
    if (!dream.trim() || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const item = await tanzakuApi.create({
        dream: dream.trim(),
        deadline: deadline || null,
      });
      window.setTimeout(() => {
        router.push(`/roadmap/${item.id}`);
      }, 900);
    } catch (err) {
      setIsSending(false);
      setError(
        err instanceof Error
          ? err.message
          : "短冊を送れませんでした。時間をおいてもう一度お試しください。",
      );
    }
  };

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <AnimatePresence>
          {isSending && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-mono-ink/12 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative h-56 w-24 rounded-2xl border border-amber-900/8 bg-gradient-to-b from-[#fffcf4] to-[#f0e4d2] shadow-elev"
                initial={{ y: 80, rotate: -4, opacity: 0 }}
                animate={{
                  y: [-10, -80, -240],
                  x: [0, 18, -10],
                  rotate: [-4, 6, -2],
                  opacity: [1, 1, 0],
                  scale: [1, 0.96, 0.7],
                }}
                transition={{ duration: 1.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p
                  className="absolute inset-4 flex items-center justify-center text-lg font-semibold leading-[2] text-[#3d3730]"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {dream}
                </p>
              </motion.div>
              <motion.p
                className="absolute bottom-[22vh] text-sm font-medium text-mono-ink/70"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                願いを空へ送っています
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
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
                <div className="relative w-full overflow-hidden rounded-[1.35rem] border border-[#b9864f]/18 bg-[linear-gradient(180deg,#fffdf7_0%,#f7eddd_54%,#ead8bf_100%)] px-3 pb-3 pt-3 shadow-[0_18px_50px_rgba(90,59,28,0.16),inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.9),transparent_34%),linear-gradient(90deg,rgba(142,97,46,0.05)_1px,transparent_1px)] bg-[length:auto,18px_18px]" />
                  <div className="relative mx-auto h-1 w-7 rounded-b-full bg-[#8b6b4a]/18" />
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

          <div className="relative w-full">
            <p className="text-xs font-medium text-foreground/75">
              期限（任意）
            </p>
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              className="mt-1.5 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-[#8b6b4a]/14 bg-white/72 py-3 pl-4 pr-3 text-left text-sm text-foreground shadow-[0_10px_28px_rgba(72,53,33,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-md transition-colors hover:bg-white/86"
            >
              <span className="min-w-0 flex-1 tabular-nums">
                {formatDateJp(deadline)}
              </span>
              <CalendarDays className="size-5 shrink-0 text-primary/70" aria-hidden />
            </button>
            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  className="absolute right-0 top-[4.6rem] z-30 w-[19.5rem] max-w-[calc(100vw-2.5rem)] rounded-[1.35rem] border border-white/65 bg-[#fffaf1]/95 p-3 shadow-[0_24px_70px_rgba(64,45,24,0.20),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl sm:left-[calc(100%+0.75rem)] sm:right-auto sm:top-[-265px]"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <button type="button" onClick={() => moveCalendarMonth(-1)} className="grid size-8 place-content-center rounded-full text-mono-ink/60 hover:bg-white/70" aria-label="前の月">
                      <ChevronLeft className="size-4" aria-hidden />
                    </button>
                    <p className="text-sm font-semibold tabular-nums text-mono-ink">
                      {calendarMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
                    </p>
                    <button type="button" onClick={() => moveCalendarMonth(1)} className="grid size-8 place-content-center rounded-full text-mono-ink/60 hover:bg-white/70" aria-label="次の月">
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
                    {["日", "月", "火", "水", "木", "金", "土"].map((day) => <span key={day}>{day}</span>)}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {calendarDays.map((date) => {
                      const ymd = toYmd(date);
                      const selected = ymd === deadline;
                      const muted = date.getMonth() !== calendarMonth.getMonth();
                      return (
                        <button
                          key={ymd}
                          type="button"
                          onClick={() => selectDate(date)}
                          className={`grid h-9 place-content-center rounded-xl text-sm tabular-nums transition-colors ${selected ? "bg-primary text-white shadow-soft" : muted ? "text-mono-ink/28 hover:bg-white/55" : "text-mono-ink/78 hover:bg-white/75"}`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              type="button"
              variant="brand"
              className="h-12 w-full gap-2 text-base font-medium shadow-[0_14px_34px_rgba(132,91,50,0.22)]"
              size="lg"
              disabled={!dream.trim() || isSending}
              onClick={sendTanzaku}
            >
              <Sparkles className="size-4" aria-hidden />
              {isSending ? "ロードマップを作成中" : "短冊を送る"}
            </Button>
            {error && (
              <p className="rounded-2xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
                {error}
              </p>
            )}
            <div className="flex w-full flex-col gap-2.5 text-center text-sm">
              <Link
                href="/roadmap"
                className="text-primary/95 font-medium underline-offset-2 hover:underline"
              >
                ロードマップを見る
              </Link>
              <Link
                href="/tanzaku/past"
                className="text-primary/80 underline-offset-2 hover:underline"
              >
                過去の短冊を見る（{pastCount}枚）
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
