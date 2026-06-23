"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Heart,
  Leaf,
  Map,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { NotebookSheet, NotebookSideTabs } from "@/components/notebook-shell";
import { pageTransition } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi } from "@/lib/api/tanzaku";
import { cn } from "@/lib/utils";

const MAX_LEN = 40;

const hintChips = [
  { label: "テーマ", icon: Leaf },
  { label: "将来", icon: Star },
  { label: "挑戦", icon: Sprout },
  { label: "想い", icon: Heart },
] as const;

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
      <motion.main {...pageTransition} className="relative min-h-[calc(100vh-var(--nav-height))]">
        <AnimatePresence>
          {isSending && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-mono-ink/12 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative h-64 w-28 rounded-[1.45rem] border border-[#c8a16c]/24 bg-gradient-to-b from-[#fffdf7] to-[#efe0c8] shadow-[0_28px_80px_rgba(76,55,32,0.18),inset_0_1px_0_rgba(255,255,255,0.88)]"
                initial={{ y: 80, rotate: -4, opacity: 0 }}
                animate={{
                  y: [-10, -90, -260],
                  x: [0, 18, -10],
                  rotate: [-4, 6, -2],
                  opacity: [1, 1, 0],
                  scale: [1, 0.96, 0.7],
                }}
                transition={{ duration: 1.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p
                  className="absolute inset-5 flex items-center justify-center text-lg font-semibold leading-[2] text-[#3d3730]"
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

        <NotebookSheet
          maxWidth="max-w-[76rem]"
          className="border-[#dbcdb8]/60 bg-[#fbf5ea] px-0 pb-0 pt-0 shadow-[0_30px_90px_rgba(59,47,32,0.10),inset_0_1px_0_rgba(255,255,255,0.78)] sm:px-0 sm:pb-0 sm:pt-0"
        >
          <NotebookSideTabs active="tanzaku" />
          <div className="relative z-10 overflow-hidden rounded-[0.55rem]">
            <span className="noise-layer pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,253,248,0.88) 0%, rgba(251,245,234,0.35) 42%, rgba(255,250,242,0.82) 100%), radial-gradient(ellipse at 72% 30%, rgba(174,187,207,0.26), transparent 34%), radial-gradient(ellipse at 34% 55%, rgba(235,190,176,0.22), transparent 32%)",
              }}
            />

            <div className="relative z-10 px-4 pb-7 pt-5 sm:px-8 sm:pb-10 sm:pt-7 lg:px-12">
              <WishTopBar onBack={() => router.back()} />
              <WishHero dream={dream} setDream={setDream} />

              <section className="mx-auto mt-8 grid max-w-[52rem] gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <DatePickerField
                  deadline={deadline}
                  calendarOpen={calendarOpen}
                  calendarMonth={calendarMonth}
                  calendarDays={calendarDays}
                  onToggle={() => setCalendarOpen((open) => !open)}
                  onMoveMonth={moveCalendarMonth}
                  onSelectDate={selectDate}
                />
                <SubmitWishButton disabled={!dream.trim() || isSending} sending={isSending} onClick={sendTanzaku} />
              </section>

              {error && (
                <p className="mx-auto mt-4 max-w-[52rem] rounded-[0.9rem] border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              )}

              <WishQuickLinks pastCount={pastCount} />
              <WritingHints />
              <NextWishCta />
            </div>
          </div>
        </NotebookSheet>
      </motion.main>
    </>
  );
}

function WishTopBar({ onBack }: { onBack: () => void }) {
  return (
    <header className="relative flex min-h-14 items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="grid size-11 place-items-center rounded-full border border-[#d8c8b3]/55 bg-[#fffaf3]/76 text-mono-ink shadow-[0_8px_24px_rgba(64,49,32,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:bg-white"
        aria-label="戻る"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <p className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-2 font-serif text-[1.35rem] font-semibold tracking-[0.18em] text-[#71824f] sm:text-[1.6rem]">
        MEMORIA
        <span className="font-sans text-[1.05rem] font-semibold tracking-[0.06em] text-[#d48397] sm:text-[1.22rem]">
          wishes
        </span>
      </p>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border border-[#d8c8b3]/55 bg-[#fffaf3]/76 text-mono-ink shadow-[0_8px_24px_rgba(64,49,32,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:bg-white"
        aria-label="その他"
      >
        <Ellipsis className="size-5" aria-hidden />
      </button>
    </header>
  );
}

function WishHero({
  dream,
  setDream,
}: {
  dream: string;
  setDream: Dispatch<SetStateAction<string>>;
}) {
  return (
    <section className="relative mt-8 min-h-[38rem] overflow-hidden lg:min-h-[44rem]">
      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
        <div className="pt-2">
          <p className="font-serif text-lg font-semibold tracking-[0.08em] text-mono-ink/78">
            短冊ドリームロード
            <Sparkles className="ml-2 inline size-4 text-[#d9a642]" aria-hidden />
          </p>
          <h1 className="mt-5 font-serif text-[2.15rem] font-semibold leading-[1.45] tracking-normal text-mono-ink sm:text-[2.75rem]">
            夢を短冊に書いてみよう
          </h1>
          <p className="mt-5 max-w-[22rem] whitespace-pre-line font-serif text-[1.02rem] leading-[2.1] text-mono-ink/78">
            あなたの夢を言葉にして、
            {"\n"}未来への一歩に。
            {"\n"}AIがあなただけのロードマップを
            {"\n"}星のように描きます。
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#768648]">
            <Sparkles className="size-4 text-[#d4a43d]" aria-hidden />
            願いごとに実在の星座が変わります
          </p>
        </div>

        <div className="relative min-h-[34rem] lg:min-h-[40rem]">
          <ConstellationBackdrop className="absolute right-0 top-0 h-[20rem] w-full max-w-[35rem] opacity-95" />
          <div className="absolute right-0 top-[8.5rem] hidden rounded-[0.85rem] border border-[#e2d4bf]/80 bg-[#fffaf3]/76 px-6 py-4 font-serif text-mono-ink shadow-[0_14px_36px_rgba(63,49,33,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-sm sm:block">
            <p className="flex items-center gap-2 text-sm text-mono-ink/62">
              <Sparkles className="size-4 text-[#d4a43d]" aria-hidden />
              今回の星座モチーフ:
            </p>
            <p className="mt-1 text-xl font-semibold">カシオペヤ座</p>
          </div>
          <TanzakuInput dream={dream} setDream={setDream} />
          <FloralWatermark />
        </div>
      </div>
    </section>
  );
}

function TanzakuInput({
  dream,
  setDream,
}: {
  dream: string;
  setDream: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="absolute left-1/2 top-[5.2rem] z-20 w-[16rem] -translate-x-1/2 sm:top-[7rem] sm:w-[18.5rem] lg:left-[42%]">
      <div className="mx-auto flex w-12 flex-col items-center" aria-hidden>
        <div className="h-14 w-5 rounded-b-full bg-gradient-to-b from-[#ffb2bd] to-[#d78087] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]" />
        <div className="-mt-1 size-5 rounded-full border border-[#cda56e]/55 bg-[#c7a36a] shadow-sm" />
      </div>
      <div className="relative -mt-1 min-h-[31rem] overflow-hidden rounded-[1.35rem] border border-[#dcc7a8]/60 bg-[#fffaf0]/86 px-5 pb-7 pt-8 shadow-[0_34px_70px_rgba(82,58,31,0.16),0_10px_22px_rgba(82,58,31,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] sm:min-h-[35rem]">
        <div
          className="pointer-events-none absolute inset-0 opacity-75"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(164,120,73,0.08) 1px, transparent 1px), radial-gradient(circle at 50% 30%, rgba(255,255,255,0.68), transparent 42%)",
            backgroundSize: "1.08rem 100%, auto",
          }}
          aria-hidden
        />
        <textarea
          value={dream}
          onChange={(e) => setDream(e.target.value.slice(0, MAX_LEN))}
          maxLength={MAX_LEN}
          spellCheck={false}
          rows={1}
          className="tanzaku-vertical-input relative z-10 mx-auto max-h-[27rem] min-h-0 resize-none self-center overflow-y-auto bg-transparent p-0 font-serif text-[1.45rem] font-semibold leading-[2.1] tracking-wide text-[#3d3730] placeholder:text-[#8b7355]/35 focus:outline-none sm:max-h-[30rem] sm:text-[1.62rem]"
          placeholder="夢を"
        />
        <span className="pointer-events-none absolute bottom-5 right-5 z-10 text-sm tabular-nums text-[#8b7355]/64">
          {dream.length}/{MAX_LEN}
        </span>
        <span className="absolute left-8 top-[42%] z-10 text-2xl text-[#d9a642]/70" aria-hidden>
          ✧
        </span>
        <span className="absolute bottom-20 right-6 z-10 text-xl text-[#d9a642]/60" aria-hidden>
          ✧
        </span>
      </div>
    </div>
  );
}

function DatePickerField({
  deadline,
  calendarOpen,
  calendarMonth,
  calendarDays,
  onToggle,
  onMoveMonth,
  onSelectDate,
}: {
  deadline: string;
  calendarOpen: boolean;
  calendarMonth: Date;
  calendarDays: Date[];
  onToggle: () => void;
  onMoveMonth: (offset: number) => void;
  onSelectDate: (date: Date) => void;
}) {
  return (
    <div className="relative min-w-0">
      <p className="mb-2 flex items-center gap-1.5 font-serif text-base font-semibold text-mono-ink/78">
        期限（任意）
        <Sparkles className="size-3.5 text-[#d9a642]" aria-hidden />
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-[0.85rem] border border-[#d9c9b3]/75 bg-white/80 px-5 text-left font-serif text-lg text-mono-ink shadow-[0_12px_30px_rgba(72,53,33,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-md transition-colors hover:bg-white sm:min-w-[26rem]"
      >
        <span className="min-w-0 flex-1 tabular-nums">{formatDateJp(deadline)}</span>
        <CalendarDays className="size-5 shrink-0 text-[#768648]" aria-hidden />
      </button>
      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="absolute left-0 top-[5.2rem] z-40 w-[19.5rem] max-w-[calc(100vw-2.5rem)] rounded-[1.15rem] border border-white/65 bg-[#fffaf1]/95 p-3 shadow-[0_24px_70px_rgba(64,45,24,0.20),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <button type="button" onClick={() => onMoveMonth(-1)} className="grid size-8 place-content-center rounded-full text-mono-ink/60 hover:bg-white/70" aria-label="前の月">
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <p className="text-sm font-semibold tabular-nums text-mono-ink">
                {calendarMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
              </p>
              <button type="button" onClick={() => onMoveMonth(1)} className="grid size-8 place-content-center rounded-full text-mono-ink/60 hover:bg-white/70" aria-label="次の月">
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
                    onClick={() => onSelectDate(date)}
                    className={cn(
                      "grid h-9 place-content-center rounded-[0.65rem] text-sm tabular-nums transition-colors",
                      selected
                        ? "bg-[#768648] text-white shadow-soft"
                        : muted
                          ? "text-mono-ink/28 hover:bg-white/55"
                          : "text-mono-ink/78 hover:bg-white/75",
                    )}
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
  );
}

function SubmitWishButton({
  disabled,
  sending,
  onClick,
}: {
  disabled: boolean;
  sending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex h-14 min-w-0 items-center justify-center gap-3 rounded-full border border-[#d9c28e]/70 bg-gradient-to-b from-[#9dab63] to-[#70853f] px-7 font-serif text-base font-semibold text-white shadow-[0_16px_42px_rgba(91,103,49,0.28),inset_0_1px_0_rgba(255,255,255,0.38),0_0_0_4px_rgba(255,255,255,0.48)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55 sm:min-w-[19rem]"
    >
      <Sparkles className="size-5 text-[#fff6be]" aria-hidden />
      {sending ? "AIロードマップを作成中" : "短冊を送ってAIロードマップを作る"}
    </button>
  );
}

function WishQuickLinks({ pastCount }: { pastCount: number }) {
  return (
    <div className="mx-auto mt-5 flex max-w-[52rem] flex-col items-center gap-3 font-serif text-base font-semibold text-[#71824f] sm:flex-row sm:justify-center sm:gap-8">
      <Link href="/roadmap" className="inline-flex items-center gap-3 transition hover:text-[#596b3c]">
        <Map className="size-5" aria-hidden />
        ロードマップを見る
        <ChevronRight className="size-4" aria-hidden />
      </Link>
      <Link href="/tanzaku/past" className="inline-flex items-center gap-3 transition hover:text-[#596b3c]">
        <BookOpen className="size-5" aria-hidden />
        過去の短冊を見る
        <span className="text-sm text-mono-ink/46">({pastCount})</span>
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function WritingHints() {
  return (
    <section className="mx-auto mt-7 max-w-[52rem] rounded-[1rem] border border-[#e1d3bf]/72 bg-[#fff8ee]/58 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="flex items-center gap-2 font-serif text-sm font-semibold text-[#71824f]">
        書き方のヒント
        <Sparkles className="size-3.5 text-[#d9a642]" aria-hidden />
      </p>
      <p className="mt-1 text-sm text-mono-ink/64">迷ったときは、テーマを選んでみましょう</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {hintChips.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-[0.8rem] border border-[#ded0bd]/70 bg-white/66 px-3 font-serif text-sm font-semibold text-mono-ink/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-white"
          >
            <Icon className="size-4 text-[#82915d]" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function NextWishCta() {
  return (
    <Link
      href="/tanzaku?fresh=1"
      className="mt-10 grid gap-5 overflow-hidden rounded-[1rem] border border-[#e2d0bd]/80 bg-[#fff4ef]/76 p-5 shadow-[0_14px_42px_rgba(59,47,32,0.07),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:-translate-y-0.5 hover:bg-[#fff8f2] sm:grid-cols-[12rem_1fr_auto] sm:items-center"
    >
      <div className="relative hidden h-24 overflow-hidden rounded-[0.7rem] bg-cover bg-center sm:block" style={{ backgroundImage: "url('/home-assets/flower-field-bg.png')" }}>
        <span className="absolute inset-0 bg-[#fff5ed]/58" aria-hidden />
      </div>
      <div>
        <p className="font-serif text-2xl font-semibold text-[#d48397]">新しい願いを送る</p>
        <p className="mt-2 font-serif text-base text-mono-ink/68">未来の自分へ、そっと願いを届けましょう。</p>
      </div>
      <span className="grid size-12 place-items-center rounded-full border border-[#e0d0b9]/70 bg-white/60 text-[#8a9a5b] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
        <ChevronRight className="size-5" aria-hidden />
      </span>
    </Link>
  );
}

function ConstellationBackdrop({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 310" fill="none" aria-hidden>
      <path d="M190 140 L250 102 L326 118 L362 175 L444 132" stroke="#f4d080" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
      {[190, 250, 326, 362, 444].map((x, index) => {
        const y = [140, 102, 118, 175, 132][index];
        return (
          <g key={x}>
            <path d={`M${x} ${y - 18}L${x + 5} ${y - 5}L${x + 18} ${y}L${x + 5} ${y + 5}L${x} ${y + 18}L${x - 5} ${y + 5}L${x - 18} ${y}L${x - 5} ${y - 5}Z`} fill="#fff9d8" stroke="#edca72" />
            <circle cx={x} cy={y} r="22" fill="#fff3b3" opacity="0.22" />
          </g>
        );
      })}
      {Array.from({ length: 38 }).map((_, index) => (
        <circle key={index} cx={(index * 41) % 500 + 8} cy={(index * 29) % 280 + 12} r={index % 5 === 0 ? 1.7 : 0.8} fill="#f3d78e" opacity="0.65" />
      ))}
    </svg>
  );
}

function FloralWatermark() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[24rem] w-[42rem] -translate-x-1/2 opacity-65" aria-hidden>
      <svg viewBox="0 0 620 360" className="h-full w-full">
        <path d="M138 290 C 128 238, 146 190, 190 146" stroke="#a9b988" strokeWidth="3" fill="none" opacity="0.36" />
        <path d="M190 146 C 174 162, 151 156, 138 135 C 168 132, 184 136, 190 146Z" fill="#a9b988" opacity="0.28" />
        <path d="M163 206 C 143 209, 128 197, 121 176 C 149 177, 161 187, 163 206Z" fill="#a9b988" opacity="0.26" />
        <path d="M126 266 C 105 258, 96 240, 99 218 C 124 229, 133 244, 126 266Z" fill="#a9b988" opacity="0.24" />
        <path d="M480 300 C 464 242, 492 185, 535 150" stroke="#a9b988" strokeWidth="3" fill="none" opacity="0.3" />
        {Array.from({ length: 9 }).map((_, index) => (
          <circle key={index} cx={500 + (index % 3) * 23} cy={210 + Math.floor(index / 3) * 31} r="8" fill="#e4a8ae" opacity="0.35" />
        ))}
        <circle cx="310" cy="210" r="168" fill="#e9d7ba" opacity="0.2" />
      </svg>
    </div>
  );
}
