"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

import { pageTransition } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi, type TanzakuStep, type TanzakuWish } from "@/lib/api/tanzaku";
import { cn } from "@/lib/utils";

type StarPoint = {
  x: number;
  y: number;
};

const STAR_PATH: StarPoint[] = [
  { x: 5, y: 76 },
  { x: 20, y: 54 },
  { x: 36, y: 47 },
  { x: 50, y: 63 },
  { x: 63, y: 49 },
  { x: 79, y: 31 },
  { x: 94, y: 22 },
];

function formatSlashDate(ymd: string | null) {
  if (!ymd) return "未設定";
  const date = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return ymd.replaceAll("-", "/");
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function pickStarPoints(count: number) {
  const total = Math.max(1, count);
  if (total === 1) return [STAR_PATH[0]];

  return Array.from({ length: total }, (_, index) => {
    const position = (index / (total - 1)) * (STAR_PATH.length - 1);
    const left = Math.floor(position);
    const right = Math.min(left + 1, STAR_PATH.length - 1);
    const ratio = position - left;
    return {
      x: STAR_PATH[left].x + (STAR_PATH[right].x - STAR_PATH[left].x) * ratio,
      y: STAR_PATH[left].y + (STAR_PATH[right].y - STAR_PATH[left].y) * ratio,
    };
  });
}

function currentStepIndex(steps: TanzakuStep[]) {
  const index = steps.findIndex((step) => !step.done);
  return index === -1 ? Math.max(steps.length - 1, 0) : index;
}

function RoadmapTopBar() {
  const router = useRouter();

  return (
    <header className="relative flex min-h-16 items-center justify-between">
      <button
        type="button"
        onClick={() => router.back()}
        className="grid size-14 place-items-center rounded-full border border-[#d8c8b3]/55 bg-[#fffaf3]/82 text-mono-ink shadow-[0_10px_26px_rgba(64,49,32,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:bg-white max-sm:size-12"
        aria-label="戻る"
      >
        <ChevronLeft className="size-7 max-sm:size-5" aria-hidden />
      </button>
      <p className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-3 font-serif text-[1.55rem] font-semibold tracking-[0.18em] text-[#71824f] max-sm:text-[1.08rem]">
        MEMORIA
        <span className="font-sans text-[1.32rem] font-semibold tracking-[0.06em] text-[#d48397] max-sm:text-[0.95rem]">
          wishes
        </span>
      </p>
      <span className="size-14 max-sm:size-12" aria-hidden />
    </header>
  );
}

function RoadmapTabs() {
  return (
    <div className="mt-6 grid h-16 grid-cols-2 overflow-hidden rounded-[1.05rem] border border-[#d9c9b3]/80 bg-[#fffaf3]/68 font-serif text-lg font-semibold text-mono-ink/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] max-sm:text-sm">
      <button type="button" className="relative grid place-items-center">
        人生ロードマップ
      </button>
      <button type="button" className="relative grid place-items-center text-[#71824f]">
        短冊ロードマップ
        <span className="absolute inset-x-7 bottom-0 h-1 bg-[#82915d]" aria-hidden />
        <span
          className="absolute bottom-[-0.55rem] left-1/2 size-4 -translate-x-1/2 rotate-45 bg-[#82915d]"
          aria-hidden
        />
      </button>
    </div>
  );
}

function WishCard({ wish }: { wish: TanzakuWish }) {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#ded0bd]/80 bg-[#fffaf0]/72 px-11 py-10 shadow-[0_18px_54px_rgba(76,55,32,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] max-sm:px-6 max-sm:py-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 82% 45%, rgba(230,212,183,0.22), transparent 28%), radial-gradient(circle at 54% 58%, rgba(244,211,159,0.16), transparent 36%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 grid gap-7 md:grid-cols-[1fr_14rem] md:items-center">
        <div>
          <p className="font-serif text-base font-bold tracking-[0.28em] text-[#71824f]">
            WISH
          </p>
          <h1 className="mt-6 max-w-[35rem] text-balance font-serif text-[2.55rem] font-semibold leading-[1.55] tracking-normal text-mono-ink max-sm:text-[1.9rem]">
            {wish.dream}
          </h1>
          <div className="mt-6 h-px w-[16rem] bg-[#cdbb9f]" aria-hidden />
          <p className="mt-5 font-serif text-[1.24rem] tracking-[0.08em] text-mono-ink/68 max-sm:text-base">
            最終期限：{formatSlashDate(wish.deadline)}
          </p>
        </div>
        <div className="relative hidden min-h-[12rem] md:block">
          <DreamOrb />
          <DecorativeBranch className="absolute bottom-[-0.3rem] right-[-0.9rem] h-32 w-32 text-[#9ea87c]/66" />
          <span className="absolute right-1 top-0 text-2xl text-[#d6ad57]/58">✧</span>
          <span className="absolute left-2 top-20 text-xl text-[#d6ad57]/48">✧</span>
        </div>
      </div>
    </section>
  );
}

function ProgressSection({
  doneCount,
  total,
  progressPct,
}: {
  doneCount: number;
  total: number;
  progressPct: number;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-[1.7rem] font-semibold text-mono-ink/82 max-sm:text-xl">
          全体の進捗
        </h2>
        <div className="flex items-end gap-7">
          <p className="pb-2 font-serif text-lg text-mono-ink/66 max-sm:text-sm">
            完了 {doneCount}/{total}
          </p>
          <p className="font-serif text-[3rem] font-semibold leading-none text-[#71824f] max-sm:text-4xl">
            {progressPct}%
          </p>
        </div>
      </div>
      <div className="mt-7 flex items-center gap-2">
        <span className="text-3xl text-[#f5d88d] drop-shadow-[0_0_12px_rgba(245,216,141,0.8)]">
          ✦
        </span>
        <div className="relative h-px flex-1 bg-[#d8c8b3]">
          <motion.div
            className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#f3d27f] shadow-[0_0_18px_rgba(243,210,127,0.72)]"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.45 }}
          />
          {Array.from({ length: Math.min(total, 7) }).map((_, index) => (
            <span
              key={index}
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[#d8cfc0]"
              style={{ left: `${(index / Math.max(Math.min(total, 7) - 1, 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-5 font-serif text-base text-mono-ink/70">
        {total}つのステップで、あなたの願いを現実にしていきましょう。
      </p>
    </section>
  );
}

function RoadmapConstellation({
  steps,
  activeIndex,
  onSelect,
}: {
  steps: TanzakuStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const points = useMemo(() => pickStarPoints(steps.length), [steps.length]);
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="relative mt-10 min-h-[24rem] overflow-hidden rounded-[1.25rem] max-sm:min-h-[32rem]">
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 12% 76%, rgba(238,177,160,0.22), transparent 28%), radial-gradient(circle at 86% 22%, rgba(190,215,219,0.2), transparent 28%), linear-gradient(180deg, transparent 0%, rgba(255,250,239,0.52) 100%)",
        }}
        aria-hidden
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="constellation-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="constellation-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f5d98d" stopOpacity="0.86" />
            <stop offset="45%" stopColor="#c69f4c" stopOpacity="0.76" />
            <stop offset="100%" stopColor="#f7dfa1" stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <polyline
          points={polyline}
          fill="none"
          stroke="#fff7d6"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.28"
          filter="url(#constellation-glow)"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke="url(#constellation-line)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.86"
        />
        <path d="M70 72 C 77 60, 84 55, 92 60" fill="none" stroke="#dbc690" strokeWidth="0.15" strokeDasharray="1 1.4" opacity="0.45" />
      </svg>
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          style={{
            left: `${(index * 23) % 100}%`,
            top: `${(index * 37) % 88}%`,
            width: index % 5 === 0 ? 3 : 2,
            height: index % 5 === 0 ? 3 : 2,
            opacity: index % 4 === 0 ? 0.85 : 0.46,
          }}
          aria-hidden
        />
      ))}
      {steps.map((step, index) => {
        const point = points[index];
        const active = index === activeIndex;
        const done = step.done;
        return (
          <button
            key={`${step.title}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className="absolute z-10 grid w-[9.6rem] -translate-x-1/2 place-items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82915d]/50 max-sm:w-[8.1rem]"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span
              className={cn(
                "relative grid size-12 place-items-center text-[2.45rem] leading-none text-[#d6ad4f] drop-shadow-[0_0_14px_rgba(240,204,108,0.72)] transition",
                active && "scale-125 text-[#f3d27f]",
                done && "text-[#82915d]",
              )}
            >
              ✦
              <span
                className={cn(
                  "absolute -top-5 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full bg-[#fffaf1]/88 font-serif text-sm text-[#8c7a5b] shadow-soft",
                  active && "bg-[#f9edbd] text-[#71824f]",
                )}
              >
                {index + 1}
              </span>
            </span>
            <span className="mt-3 line-clamp-2 font-serif text-base font-semibold leading-snug text-mono-ink/82 max-sm:text-sm">
              {step.title}
            </span>
          </button>
        );
      })}
    </section>
  );
}

function StepDetailCard({
  step,
  index,
  total,
  saving,
  onToggle,
}: {
  step: TanzakuStep;
  index: number;
  total: number;
  saving: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-[1.8rem] border border-[#ded0bd]/80 bg-[#fffaf0]/78 px-10 py-8 shadow-[0_18px_54px_rgba(76,55,32,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] max-sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 80% 56%, rgba(244,211,159,0.22), transparent 30%), radial-gradient(circle at 86% 32%, rgba(220,232,222,0.24), transparent 26%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 grid gap-7 md:grid-cols-[1fr_18rem] md:items-center">
        <div>
          <div className="flex items-center gap-6">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border border-[#d5bd83]/70 bg-[#b6b883] font-serif text-3xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_6px_rgba(255,250,239,0.75)]">
              {index + 1}
            </span>
            <h2 className="font-serif text-[2.25rem] font-semibold leading-tight text-mono-ink max-sm:text-2xl">
              {step.title}
            </h2>
          </div>
          <p className="mt-7 max-w-[34rem] whitespace-pre-line font-serif text-[1.18rem] leading-[2] text-mono-ink/76 max-sm:text-base">
            {step.detail}
          </p>
          <div className="mt-6 inline-flex min-w-[17rem] items-center gap-4 rounded-[0.95rem] border border-[#e1d3bf]/72 bg-white/50 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
            <CalendarDays className="size-6 text-[#82915d]" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-mono-ink/56">期限</p>
              <p className="mt-1 font-serif text-xl tabular-nums text-mono-ink/72">
                {formatSlashDate(step.dueDate)}
              </p>
            </div>
          </div>
          <div className="mt-7">
            <p className="font-serif text-base font-semibold text-[#9b925f]">
              このステップで大切にしたいこと
            </p>
            <ul className="mt-3 space-y-1.5 font-serif text-base leading-relaxed text-mono-ink/70">
              {makeCarePoints(step, index, total).map((point) => (
                <li key={point}>・ {point}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onToggle}
            className={cn(
              "mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 font-serif text-base font-semibold transition disabled:opacity-55",
              step.done
                ? "border-[#c8d0a5] bg-[#eef2dc] text-[#71824f]"
                : "border-[#d9c28e]/70 bg-gradient-to-b from-[#9ead64] to-[#718640] text-white shadow-[0_12px_30px_rgba(91,103,49,0.22),inset_0_1px_0_rgba(255,255,255,0.32)]",
            )}
          >
            <Check className="size-5" aria-hidden />
            {step.done ? "完了済み" : "このステップを完了する"}
          </button>
        </div>
        <div className="relative hidden min-h-[18rem] md:block">
          <NotebookIllustration />
        </div>
      </div>
    </section>
  );
}

function makeCarePoints(step: TanzakuStep, index: number, total: number) {
  const title = step.title.replace(/\s+/g, "");
  if (index === 0) {
    return ["今の状態を言葉にする", "叶えたい理由をはっきりさせる"];
  }
  if (index === total - 1) {
    return ["成果を振り返る", "次の願いにつながる記録を残す"];
  }
  return [`${title || "この行動"}を小さく試す`, "続けやすい形に整える"];
}

function DecorativeBranch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M18 102 C 46 74, 78 48, 100 12" stroke="currentColor" strokeWidth="2" />
      {[28, 42, 58, 74, 88].map((y, index) => (
        <path
          key={y}
          d={`M${42 + index * 10} ${y} C ${22 + index * 11} ${y - 10}, ${20 + index * 10} ${y - 26}, ${48 + index * 8} ${y - 12}Z`}
          fill="currentColor"
          opacity="0.58"
        />
      ))}
    </svg>
  );
}

function DreamOrb() {
  return (
    <svg className="absolute right-0 top-0 h-48 w-48" viewBox="0 0 200 200" fill="none" aria-hidden>
      <defs>
        <radialGradient id="dream-orb-wash" cx="40%" cy="34%" r="64%">
          <stop offset="0%" stopColor="#fff7e4" stopOpacity="0.96" />
          <stop offset="31%" stopColor="#f3cfd0" stopOpacity="0.7" />
          <stop offset="62%" stopColor="#cbdadc" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#ecd7ad" stopOpacity="0.48" />
        </radialGradient>
        <filter id="dream-orb-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="98" cy="92" r="78" fill="url(#dream-orb-wash)" stroke="#e0c493" strokeWidth="1.4" />
      <circle cx="98" cy="92" r="70" fill="none" stroke="white" strokeOpacity="0.56" />
      <path d="M42 120 C 70 86, 105 71, 154 57" stroke="#d5ad5c" strokeWidth="0.9" strokeDasharray="2 5" opacity="0.34" />
      <path d="M50 56 C 86 78, 120 93, 164 118" stroke="#ffffff" strokeWidth="1.2" opacity="0.44" />
      <path d="M48 140 C 82 126, 118 132, 151 151" stroke="#ffffff" strokeWidth="1" opacity="0.36" />
      <text x="98" y="108" textAnchor="middle" fill="white" fontSize="66" filter="url(#dream-orb-glow)">
        ✦
      </text>
      {[
        [48, 84, 3],
        [68, 134, 2.2],
        [120, 55, 2.4],
        [145, 102, 2.8],
        [88, 70, 1.8],
        [132, 137, 2],
      ].map(([cx, cy, r], index) => (
        <circle key={index} cx={cx} cy={cy} r={r} fill="#fff8d7" opacity="0.86" />
      ))}
      <circle cx="98" cy="92" r="82" fill="none" stroke="#f6e7c2" strokeOpacity="0.52" strokeWidth="3" />
    </svg>
  );
}

function NotebookIllustration() {
  return (
    <svg className="absolute bottom-0 right-0 h-72 w-72" viewBox="0 0 280 280" fill="none" aria-hidden>
      <defs>
        <linearGradient id="book-page-left" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff8e9" />
          <stop offset="100%" stopColor="#ead8b9" />
        </linearGradient>
        <linearGradient id="book-page-right" x1="1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff8e9" />
          <stop offset="100%" stopColor="#ead8b9" />
        </linearGradient>
        <filter id="book-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#6f5635" floodOpacity="0.16" />
        </filter>
      </defs>
      <ellipse cx="132" cy="226" rx="92" ry="18" fill="#a98755" opacity="0.13" />
      <path d="M49 86 L132 122 L132 220 L48 185 Z" fill="#d7bd92" opacity="0.42" filter="url(#book-shadow)" />
      <path d="M132 122 L218 84 L218 184 L132 220 Z" fill="#d7bd92" opacity="0.38" filter="url(#book-shadow)" />
      <path d="M57 76 C 82 85, 105 97, 132 122 L132 214 C 108 192, 80 181, 54 174 Z" fill="url(#book-page-left)" stroke="#c7a77b" strokeWidth="1.3" />
      <path d="M132 122 C 158 98, 185 83, 212 74 L212 174 C 184 181, 157 193, 132 214 Z" fill="url(#book-page-right)" stroke="#c7a77b" strokeWidth="1.3" />
      <path d="M132 122 C 128 151, 128 184, 132 214" stroke="#a98b67" strokeWidth="2.2" opacity="0.45" />
      <path d="M134 124 C 141 150, 140 184, 132 214" stroke="#ffffff" strokeWidth="1.2" opacity="0.44" />
      <path d="M128 128 C 110 107, 83 93, 60 85" stroke="#fff7e8" strokeWidth="1.2" opacity="0.65" />
      <path d="M136 128 C 157 108, 184 93, 207 84" stroke="#fff7e8" strokeWidth="1.2" opacity="0.65" />
      <path d="M126 126 C 121 154, 121 184, 126 210" stroke="#d89196" strokeWidth="2" opacity="0.35" />
      {Array.from({ length: 8 }).map((_, index) => (
        <path
          key={`page-line-left-${index}`}
          d={`M72 ${105 + index * 10} C 91 ${112 + index * 9}, 106 ${121 + index * 8}, 121 ${136 + index * 7}`}
          stroke="#c6a47a"
          strokeWidth="1"
          opacity="0.26"
        />
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <path
          key={`page-line-right-${index}`}
          d={`M145 ${137 + index * 7} C 163 ${121 + index * 8}, 181 ${111 + index * 9}, 202 ${103 + index * 10}`}
          stroke="#c6a47a"
          strokeWidth="1"
          opacity="0.26"
        />
      ))}
      <path d="M165 183 L223 133" stroke="#a87449" strokeWidth="7" strokeLinecap="round" opacity="0.72" />
      <path d="M166 182 L225 132" stroke="#efca8d" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M221 88 C 238 71, 258 82, 252 105 C 248 121, 232 128, 222 113 C 211 126, 197 116, 204 101 C 208 92, 216 88, 221 88Z" fill="#f0b8bc" opacity="0.72" />
      <path d="M221 88 C 209 70, 225 54, 241 70 C 252 82, 243 98, 225 100" fill="#f5c9cc" opacity="0.58" />
      <circle cx="230" cy="102" r="10" fill="#e6c071" opacity="0.84" />
      <circle cx="230" cy="102" r="4" fill="#fff2bd" opacity="0.9" />
      <path d="M230 126 C 232 160, 214 190, 188 212" stroke="#8fa375" strokeWidth="2.2" opacity="0.64" />
      <path d="M211 160 C 230 157, 244 145, 251 125 C 229 130, 215 142, 211 160Z" fill="#9cad7e" opacity="0.46" />
      <path d="M200 190 C 181 181, 173 166, 176 148 C 196 157, 205 171, 200 190Z" fill="#9cad7e" opacity="0.4" />
      {[
        [42, 106],
        [70, 226],
        [224, 70],
        [246, 206],
        [112, 96],
        [170, 238],
      ].map(([x, y], index) => (
        <text key={index} x={x} y={y} fill="#d7ad57" fontSize="22" opacity="0.55">
          ✧
        </text>
      ))}
    </svg>
  );
}

export default function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [wish, setWish] = useState<TanzakuWish | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSteps, setSavingSteps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    tanzakuApi
      .get(id)
      .then((item) => {
        if (ignore) return;
        setWish(item);
        setSelectedStep(currentStepIndex(item.steps));
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
  const totalSteps = wish?.steps.length ?? 0;
  const progressPct = useMemo(() => {
    if (!wish?.steps.length) return 0;
    return Math.round((doneCount / wish.steps.length) * 100);
  }, [doneCount, wish?.steps.length]);

  const saveSteps = async (steps: TanzakuStep[]) => {
    if (!wish) return;
    setSavingSteps(true);
    setError(null);
    const previous = wish;
    setWish({ ...wish, steps });
    try {
      const saved = await tanzakuApi.update(wish.id, { steps });
      setWish(saved);
      setSelectedStep((current) => Math.min(current, Math.max(saved.steps.length - 1, 0)));
    } catch {
      setWish(previous);
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

  const activeStep = wish?.steps[selectedStep] ?? wish?.steps[0] ?? null;

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.main
        {...pageTransition}
        className="relative min-h-screen overflow-hidden bg-[#fbf4e8]/40"
      >
        <span className="noise-layer pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,253,247,0.94) 0%, rgba(251,244,232,0.72) 54%, rgba(255,249,239,0.94) 100%), radial-gradient(ellipse at 24% 58%, rgba(238,181,170,0.18), transparent 28%), radial-gradient(ellipse at 82% 58%, rgba(192,216,219,0.22), transparent 30%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-[59rem] px-8 pb-16 pt-7 sm:px-12">
          <RoadmapTopBar />
          <RoadmapTabs />

          <p className="mt-9 flex items-center justify-center gap-4 font-serif text-[1.35rem] text-mono-ink/72 max-sm:text-base">
            <Sparkles className="size-6 text-[#d7ad57]" aria-hidden />
            この願いの道筋を、ひとつずつ。
          </p>

          {loading && (
            <p className="mt-10 rounded-[1.5rem] border border-[#ded0bd]/70 bg-[#fffaf0]/72 p-6 text-center text-sm text-muted-foreground shadow-soft">
              ロードマップを読み込んでいます
            </p>
          )}

          {!loading && !wish && (
            <p className="mt-10 rounded-[1.5rem] border border-[#ded0bd]/70 bg-[#fffaf0]/72 p-6 text-center text-sm text-muted-foreground shadow-soft">
              {error ?? "ロードマップが見つかりません"}
            </p>
          )}

          {wish && (
            <>
              <WishCard wish={wish} />
              <ProgressSection doneCount={doneCount} total={totalSteps} progressPct={progressPct} />

              {error && (
                <p className="mt-5 rounded-[0.9rem] border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              )}

              <RoadmapConstellation
                steps={wish.steps}
                activeIndex={selectedStep}
                onSelect={setSelectedStep}
              />

              {savingSteps && (
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  保存中
                </p>
              )}

              <AnimatePresence mode="wait">
                {activeStep && (
                  <motion.div
                    key={`${selectedStep}-${activeStep.title}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <StepDetailCard
                      step={activeStep}
                      index={selectedStep}
                      total={totalSteps}
                      saving={savingSteps}
                      onToggle={() => toggleStep(selectedStep)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.main>
    </>
  );
}
