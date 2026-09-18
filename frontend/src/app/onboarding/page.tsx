"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Feather, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  description: string;
  note: string;
  accent: "sage" | "sand" | "blush";
  visual: "photo" | "journal" | "keepsake";
};

const slides: Slide[] = [
  {
    title: "写真を、思い出の1ページに。",
    description:
      "残しておきたい一枚に、短い言葉を添えるだけ。MEMORIAが今日の記録をそっと整えます。",
    note: "写真 + ひとこと",
    accent: "sage",
    visual: "photo",
  },
  {
    title: "気持ちまで、やわらかく残す。",
    description:
      "AIは前に出すぎず、あなたの言葉と写真から、その日の空気を読み取る手伝いをします。",
    note: "AIが静かに整理",
    accent: "blush",
    visual: "journal",
  },
  {
    title: "あとから開きたくなる記録へ。",
    description:
      "思い出、感情、これから叶えたいことを、手元のノートのように見返せる場所に。",
    note: "記録を育てる",
    accent: "sand",
    visual: "keepsake",
  },
];

const accentClass: Record<Slide["accent"], string> = {
  sage: "bg-mono-sage/12 text-primary ring-primary/14",
  sand: "bg-mono-sand/14 text-[#7a6244] ring-mono-sand/20",
  blush: "bg-mono-blush/14 text-[#875a55] ring-mono-blush/20",
};

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      goToLogin();
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-5 pb-8 pt-safe">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,252,246,0.9),rgba(255,252,246,0))]"
      />
      <div
        aria-hidden
        className="noise-layer pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.32em] text-primary/80">
              MEMORIA
            </p>
            <p className="mt-1 text-xs text-muted-foreground">小さな記録帳</p>
          </div>
          <button
            onClick={goToLogin}
            className="rounded-full bg-white/52 px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-mono-ink/6 transition hover:bg-white/75 hover:text-foreground"
          >
            スキップ
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={transitions.gentle}
            className="flex flex-col"
          >
            <MemoryDesk slide={slide} />

            <div className="mt-8">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                  accentClass[slide.accent],
                )}
              >
                {slide.visual === "photo" && <ImageIcon className="size-3" aria-hidden />}
                {slide.visual === "journal" && <Feather className="size-3" aria-hidden />}
                {slide.visual === "keepsake" && <BookOpen className="size-3" aria-hidden />}
                {slide.note}
              </span>
              <h1 className="mt-4 text-[1.72rem] font-semibold leading-tight tracking-normal text-foreground">
                {slide.title}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-5">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-7 bg-primary" : "w-2 bg-mono-ink/18",
              )}
              aria-label={`スライド${i + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="h-12 w-full rounded-full text-base font-medium"
          variant="brand"
          size="lg"
        >
          {isLast ? "ログインしてはじめる" : "次へ"}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function MemoryDesk({ slide }: { slide: Slide }) {
  return (
    <div className="relative mx-auto aspect-[1.04/1] w-full max-w-[22rem]">
      <div className="absolute inset-x-4 bottom-5 h-28 rounded-[50%] bg-mono-ink/[0.055] blur-2xl" />
      <div className="absolute inset-0 rounded-[1.6rem] border border-white/55 bg-[#f9f3e8]/78 shadow-elev ring-1 ring-mono-ink/5" />
      <div className="absolute inset-x-6 top-6 h-px bg-mono-ink/7" />
      <div className="absolute left-8 right-8 top-12 space-y-3">
        <div className="h-px bg-mono-ink/6" />
        <div className="h-px bg-mono-ink/6" />
        <div className="h-px bg-mono-ink/6" />
      </div>

      {slide.visual === "photo" && (
        <div className="absolute left-7 top-8 w-[68%] rotate-[-4deg] rounded-[0.65rem] bg-white p-2 shadow-soft ring-1 ring-mono-ink/8">
          <div className="relative aspect-[307/204] overflow-hidden rounded-[0.45rem] bg-mono-cream">
            <Image
              src="/onboarding-memory-page.png"
              alt=""
              fill
              priority
              quality={100}
              sizes="18rem"
              className="object-cover"
            />
          </div>
          <div className="mt-2 h-2 w-24 rounded-full bg-mono-linen/35" />
        </div>
      )}

      {slide.visual === "journal" && (
        <div className="absolute left-9 top-8 w-[68%] rotate-[-2deg] rounded-[0.9rem] border border-mono-linen/28 bg-[#fffdf7] p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-mono-blush" aria-hidden />
            <div className="h-2 w-24 rounded-full bg-mono-blush/25" />
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-mono-ink/10" />
            <div className="h-2 w-4/5 rounded-full bg-mono-ink/8" />
            <div className="h-2 w-3/5 rounded-full bg-mono-ink/8" />
          </div>
          <div className="mt-4 flex gap-1.5">
            <span className="h-5 w-12 rounded-full bg-mono-sage/18" />
            <span className="h-5 w-10 rounded-full bg-mono-blush/18" />
          </div>
        </div>
      )}

      {slide.visual === "keepsake" && (
        <div className="absolute left-8 top-8 grid w-[70%] rotate-[-3deg] gap-2 rounded-[0.8rem] bg-white/88 p-3 shadow-soft ring-1 ring-mono-ink/8">
          <div className="grid grid-cols-[3.5rem_1fr] gap-3">
            <div className="aspect-square rounded-[0.45rem] bg-mono-sand/20" />
            <div className="space-y-2 pt-1">
              <div className="h-2 rounded-full bg-mono-ink/10" />
              <div className="h-2 w-2/3 rounded-full bg-mono-ink/8" />
              <div className="h-5 w-16 rounded-full bg-mono-sage/16" />
            </div>
          </div>
          <div className="h-px bg-mono-ink/7" />
          <div className="h-2 w-4/5 rounded-full bg-mono-ink/8" />
        </div>
      )}

      <div className="absolute bottom-8 right-8 h-24 w-3 rotate-[34deg] rounded-full bg-[#7d674b] shadow-ambient">
        <div className="absolute -top-4 left-1/2 h-5 w-3 -translate-x-1/2 rounded-t-full bg-mono-sand" />
        <div className="absolute bottom-1 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-[#eadfcf]" />
      </div>
      <div className="absolute right-16 top-7 h-8 w-16 rotate-[8deg] rounded-[0.3rem] bg-mono-sage/14 ring-1 ring-mono-sage/12" />
      <div className="absolute bottom-12 left-7 h-7 w-20 rotate-[5deg] rounded-[0.4rem] bg-mono-blush/14 ring-1 ring-mono-blush/12" />
    </div>
  );
}
