"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Map,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { NotebookSideTabs } from "@/components/notebook-shell";
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

        <div className="relative mx-auto min-h-screen w-full max-w-[59rem] overflow-hidden px-8 pb-10 pt-7 sm:px-16">
          <NotebookSideTabs active="tanzaku" />
          <span className="noise-layer pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,253,247,0.94) 0%, rgba(251,244,232,0.70) 50%, rgba(255,249,239,0.92) 100%), radial-gradient(ellipse at 68% 26%, rgba(244,221,164,0.22), transparent 33%), radial-gradient(ellipse at 42% 47%, rgba(232,209,178,0.26), transparent 30%)",
            }}
          />

          <div className="relative z-10">
            <WishTopBar />
            <WishHero dream={dream} setDream={setDream} />

            <section className="mx-auto mt-0 grid max-w-[37rem] gap-5">
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
              <p className="mx-auto mt-4 max-w-[37rem] rounded-[0.9rem] border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
                {error}
              </p>
            )}

            <WishQuickLinks pastCount={pastCount} />
            <WritingHints />
          </div>
        </div>
      </motion.main>
    </>
  );
}

function WishTopBar() {
  return (
    <header className="relative flex min-h-16 items-center justify-center pr-0 min-[760px]:pr-14">
      <p className="flex items-baseline gap-3 font-serif text-[1.55rem] font-semibold tracking-[0.18em] text-[#71824f] max-sm:text-[1.1rem]">
        MEMORIA
        <span className="font-sans text-[1.32rem] font-semibold tracking-[0.06em] text-[#d48397] max-sm:text-[0.95rem]">
          wishes
        </span>
      </p>
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
    <section className="relative mt-10 min-h-[66.5rem] overflow-hidden max-sm:min-h-[55rem]">
      <ConstellationBackdrop className="absolute right-[-1.8rem] top-[2.1rem] h-[18rem] w-[26rem] opacity-95 max-sm:right-[-9rem] max-sm:top-[8rem]" />
      <FloralWatermark />
      <div className="relative z-10">
        <div className="pt-2">
          <p className="font-serif text-[1.25rem] font-semibold tracking-[0.1em] text-mono-ink/76 max-sm:text-base">
            短冊ドリームロード
            <Sparkles className="ml-2 inline size-4 text-[#d9a642]" aria-hidden />
          </p>
          <h1 className="mt-6 font-serif text-[2.5rem] font-semibold leading-[1.45] tracking-normal text-mono-ink max-sm:text-[2rem]">
            夢を短冊に書いてみよう
          </h1>
          <p className="mt-5 max-w-[25rem] whitespace-pre-line font-serif text-[1.25rem] leading-[2.15] text-mono-ink/78 max-sm:text-base">
            あなたの夢を言葉にして、
            {"\n"}未来への一歩に。
            {"\n"}AIがあなただけのロードマップを
            {"\n"}星のように描きます。
          </p>
        </div>

        <TanzakuInput dream={dream} setDream={setDream} />
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
    <div className="absolute left-1/2 top-[16.1rem] z-20 w-[18.7rem] -translate-x-1/2 max-sm:top-[17rem] max-sm:w-[15rem]">
      <div className="mx-auto flex w-12 flex-col items-center" aria-hidden>
        <div className="h-14 w-5 rounded-b-full bg-gradient-to-b from-[#ffb7c1] to-[#d97f87] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]" />
        <div className="-mt-1 size-5 rounded-full border border-[#cda56e]/55 bg-[#c5a06b] shadow-sm" />
      </div>
      <div className="relative -mt-1 min-h-[47.2rem] overflow-hidden rounded-[1.3rem] border border-[#dcc7a8]/64 bg-[#fffaf0]/88 px-5 pb-7 pt-9 shadow-[0_34px_72px_rgba(82,58,31,0.16),0_10px_22px_rgba(82,58,31,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] max-sm:min-h-[35rem]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(164,120,73,0.08) 1px, transparent 1px), radial-gradient(circle at 50% 28%, rgba(255,255,255,0.70), transparent 42%)",
            backgroundSize: "1.05rem 100%, auto",
          }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-20 top-24 z-10 flex items-center justify-center px-7 max-sm:bottom-16 max-sm:top-20">
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value.slice(0, MAX_LEN))}
            maxLength={MAX_LEN}
            spellCheck={false}
            rows={1}
            className="tanzaku-vertical-input h-full max-h-full min-h-0 resize-none overflow-y-auto bg-transparent p-0 font-serif text-[1.58rem] font-semibold leading-[2.15] tracking-wide text-[#3d3730] placeholder:text-[#8b7355]/35 focus:outline-none max-sm:text-[1.35rem]"
            placeholder="夢を"
          />
        </div>
        <span className="pointer-events-none absolute bottom-7 right-6 z-10 text-lg tabular-nums text-[#8b7355]/62 max-sm:text-sm">
          {dream.length}/{MAX_LEN}
        </span>
        <span className="absolute right-9 top-20 z-10 text-3xl text-[#d9a642]/70" aria-hidden>
          ✧
        </span>
        <span className="absolute left-8 top-[48%] z-10 text-2xl text-[#d9a642]/70" aria-hidden>
          ✧
        </span>
        <span className="absolute bottom-24 right-6 z-10 text-xl text-[#d9a642]/60" aria-hidden>
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
      <p className="mb-3 flex items-center gap-1.5 font-serif text-[1.1rem] font-semibold text-mono-ink/78">
        期限（任意）
        <Sparkles className="size-3.5 text-[#d9a642]" aria-hidden />
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-16 w-full cursor-pointer items-center justify-between gap-3 rounded-[0.85rem] border border-[#d9c9b3]/75 bg-white/82 px-7 text-left font-serif text-[1.35rem] text-mono-ink shadow-[0_12px_30px_rgba(72,53,33,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-colors hover:bg-white max-sm:px-5 max-sm:text-base"
      >
        <span className="min-w-0 flex-1 tabular-nums">{formatDateJp(deadline)}</span>
        <CalendarDays className="size-6 shrink-0 text-[#768648] max-sm:size-5" aria-hidden />
      </button>
      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="absolute left-0 top-[5.8rem] z-40 w-[19.5rem] max-w-[calc(100vw-2.5rem)] rounded-[1.15rem] border border-white/65 bg-[#fffaf1]/95 p-3 shadow-[0_24px_70px_rgba(64,45,24,0.20),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl"
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
      className="group flex h-[4.6rem] min-w-0 items-center justify-center gap-4 rounded-full border border-[#d9c28e]/70 bg-gradient-to-b from-[#9ead64] to-[#718640] px-7 font-serif text-[1.22rem] font-semibold text-white shadow-[0_16px_42px_rgba(91,103,49,0.28),inset_0_1px_0_rgba(255,255,255,0.38),0_0_0_5px_rgba(255,255,255,0.50)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55 max-sm:h-14 max-sm:text-sm"
    >
      <Sparkles className="size-8 text-[#fff6be] max-sm:size-5" aria-hidden />
      {sending ? "AIロードマップを作成中" : "短冊を送ってAIロードマップを作る"}
    </button>
  );
}

function WishQuickLinks({ pastCount }: { pastCount: number }) {
  return (
    <div className="mx-auto mt-7 flex max-w-[37rem] flex-col items-center gap-3.5 font-serif text-[1.18rem] font-semibold text-[#71824f] max-sm:text-base">
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
    <section className="mx-auto mt-7 max-w-[37rem] rounded-[1rem] border border-[#e1d3bf]/72 bg-[#fff8ee]/58 px-8 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] max-sm:px-5">
      <p className="flex items-center gap-2 font-serif text-[1rem] font-semibold text-[#71824f]">
        書き方のヒント
        <Sparkles className="size-3.5 text-[#d9a642]" aria-hidden />
      </p>
      <p className="mt-1 text-sm text-mono-ink/64">迷ったときは、テーマを選んでみましょう</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {hintChips.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-[0.8rem] border border-[#ded0bd]/70 bg-white/66 px-3 font-serif text-sm font-semibold text-mono-ink/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-white"
          >
            <Icon className="size-4 text-[#82915d]" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ConstellationBackdrop({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 310" fill="none" aria-hidden>
      <path d="M150 188 L218 142 L298 106 L380 70 L444 28" stroke="#f5d991" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      {[150, 218, 298, 380, 444].map((x, index) => {
        const y = [188, 142, 106, 70, 28][index];
        return (
          <g key={x}>
            <path d={`M${x} ${y - 18}L${x + 5} ${y - 5}L${x + 18} ${y}L${x + 5} ${y + 5}L${x} ${y + 18}L${x - 5} ${y + 5}L${x - 18} ${y}L${x - 5} ${y - 5}Z`} fill="#fff9d8" stroke="#edca72" />
            <circle cx={x} cy={y} r="22" fill="#fff3b3" opacity="0.22" />
          </g>
        );
      })}
      {Array.from({ length: 48 }).map((_, index) => (
        <circle key={index} cx={(index * 41) % 500 + 8} cy={(index * 29) % 280 + 12} r={index % 5 === 0 ? 1.7 : 0.8} fill="#f3d78e" opacity="0.62" />
      ))}
    </svg>
  );
}

function FloralWatermark() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[27.5rem] z-0 h-[31rem] w-[52rem] -translate-x-1/2 opacity-90 max-sm:top-[26rem] max-sm:w-[38rem]" aria-hidden>
      <svg viewBox="0 0 760 470" className="h-full w-full">
        <defs>
          <filter id="floral-soften" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <radialGradient id="floral-wash" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#efe2c9" stopOpacity="0.22" />
            <stop offset="62%" stopColor="#ead8bb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ead8bb" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="leaf-wash" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b5c49b" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#8fa375" stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id="petal-wash" cx="48%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#f4d0d0" stopOpacity="0.74" />
            <stop offset="100%" stopColor="#df9fa8" stopOpacity="0.26" />
          </radialGradient>
        </defs>

        <ellipse cx="380" cy="250" rx="304" ry="214" fill="url(#floral-wash)" filter="url(#floral-soften)" />
        <ellipse cx="380" cy="252" rx="248" ry="174" fill="#efe2c9" opacity="0.08" />

        <g filter="url(#floral-soften)">
          <path d="M104 360 C 120 300, 140 248, 190 187" stroke="#99aa7d" strokeWidth="3.4" fill="none" opacity="0.42" />
          <path d="M166 232 C 140 234, 122 219, 116 192 C 151 196, 166 209, 166 232Z" fill="url(#leaf-wash)" opacity="0.56" />
          <path d="M186 194 C 160 190, 147 172, 151 146 C 181 158, 192 173, 186 194Z" fill="url(#leaf-wash)" opacity="0.48" />
          <path d="M136 286 C 108 281, 92 262, 94 236 C 126 248, 140 264, 136 286Z" fill="url(#leaf-wash)" opacity="0.48" />
          <path d="M116 333 C 88 320, 78 296, 88 270 C 116 288, 124 309, 116 333Z" fill="url(#leaf-wash)" opacity="0.42" />
          <path d="M148 258 C 164 232, 172 211, 174 185" stroke="#99aa7d" strokeWidth="1.6" fill="none" opacity="0.24" />

          <path d="M118 382 C 77 356, 47 354, 26 373" stroke="#a7b589" strokeWidth="2.2" fill="none" opacity="0.3" />
          {[
            [24, 372],
            [42, 360],
            [62, 363],
            [36, 386],
          ].map(([cx, cy], index) => (
            <g key={`left-flower-${index}`}>
              <circle cx={cx} cy={cy} r="5.6" fill="url(#petal-wash)" opacity="0.48" />
              <circle cx={cx + 5} cy={cy - 3} r="3.7" fill="#e7aab0" opacity="0.32" />
              <circle cx={cx - 4} cy={cy - 4} r="3.3" fill="#f1c5c5" opacity="0.38" />
            </g>
          ))}
        </g>

        <g filter="url(#floral-soften)">
          <path d="M600 364 C 580 307, 596 242, 655 184" stroke="#97a87b" strokeWidth="3" fill="none" opacity="0.38" />
          <path d="M618 314 C 648 309, 669 290, 675 262 C 640 267, 622 286, 618 314Z" fill="url(#leaf-wash)" opacity="0.38" />
          <path d="M628 271 C 604 268, 589 252, 591 229 C 621 237, 633 250, 628 271Z" fill="url(#leaf-wash)" opacity="0.34" />
          <path d="M650 205 C 623 204, 604 188, 599 164 C 632 168, 649 181, 650 205Z" fill="url(#leaf-wash)" opacity="0.32" />
          <path d="M581 334 C 542 298, 529 263, 542 230" stroke="#97a87b" strokeWidth="2.2" fill="none" opacity="0.26" />
          <path d="M658 315 C 684 281, 700 242, 708 198" stroke="#97a87b" strokeWidth="2.1" fill="none" opacity="0.3" />
          {[
            [540, 231],
            [552, 251],
            [568, 276],
            [702, 197],
            [693, 224],
            [677, 250],
            [663, 279],
            [626, 180],
            [648, 196],
            [668, 215],
            [596, 306],
            [614, 330],
          ].map(([cx, cy], index) => (
            <g key={`right-flower-${index}`}>
              <circle cx={cx} cy={cy} r="5.4" fill="url(#petal-wash)" opacity="0.46" />
              <circle cx={cx + 4} cy={cy - 4} r="3.4" fill="#e4a2aa" opacity="0.34" />
              <circle cx={cx - 4} cy={cy - 3} r="3.1" fill="#f1c5c5" opacity="0.34" />
            </g>
          ))}
        </g>

        {[
          [58, 174, 16],
          [112, 408, 12],
          [630, 156, 13],
          [692, 351, 11],
          [332, 384, 14],
          [462, 118, 10],
        ].map(([x, y, size], index) => (
          <path
            key={`floral-spark-${index}`}
            d={`M${x} ${y - size} L${x + size * 0.22} ${y - size * 0.22} L${x + size} ${y} L${x + size * 0.22} ${y + size * 0.22} L${x} ${y + size} L${x - size * 0.22} ${y + size * 0.22} L${x - size} ${y} L${x - size * 0.22} ${y - size * 0.22}Z`}
            fill="#f5d88d"
            opacity="0.44"
          />
        ))}
      </svg>
    </div>
  );
}
