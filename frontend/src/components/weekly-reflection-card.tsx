"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";

import { weeklyReflectionApi, type WeeklyReflection } from "@/lib/api/weekly-reflection";

export function WeeklyReflectionCard() {
  const [item, setItem] = useState<WeeklyReflection | null>(null);

  useEffect(() => {
    let cancelled = false;
    weeklyReflectionApi.current().then(({ item: next }) => {
      if (!cancelled) setItem(next);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!item) return null;

  return (
    <section className="rounded-[1rem] border border-mono-linen/30 bg-[#fff8df]/72 p-5 shadow-soft ring-1 ring-white/45">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3d46f]/55 text-[#8c6a20]">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#8c6a20]">WEEKLY MEMORIA</p>
          <h2 className="mt-0.5 font-serif text-lg font-semibold text-mono-ink">今週のふりかえり</h2>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-mono-ink/75">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/62 px-3 py-1 ring-1 ring-mono-ink/6"><CalendarDays className="size-3" /> {item.memoryCount}件の記録</span>
        {item.topEmotion && <span className="rounded-full bg-white/62 px-3 py-1 ring-1 ring-mono-ink/6">気分: {item.topEmotion}</span>}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-mono-ink/85">{item.comment}</p>
    </section>
  );
}
