"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { transitions } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";

const slides: {
  step: number;
  titleLines: [string, string];
  sub: string;
  imageUrl: string;
}[] = [
  {
    step: 1,
    titleLines: ["写真とひとことが、", "あなただけの１ページに"],
    sub: "何気ない日常が、未来の宝物に変わります。",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82d8?w=900&h=700&fit=crop&q=80",
  },
  {
    step: 2,
    titleLines: ["感情を動物がそっと映す", "あなたの今が、見えてくる"],
    sub: "AIがあなたの感情を読み取り、相棒の動物として可視化します。",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&h=700&fit=crop&q=80",
  },
  {
    step: 3,
    titleLines: ["夢を短冊に、", "未来への地図をつくる"],
    sub: "願いを言葉にして、小さな一歩を積み重ねていきましょう。",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=700&fit=crop&q=80",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.push("/");
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  return (
    <>
      <RouteAtmosphere variant="welcome" />
      <div className="relative flex min-h-dvh flex-col bg-mono-paper/30">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-mono-cream/40 via-transparent to-mono-paper/80" />

        <header className="relative z-10 flex justify-end px-5 pt-safe">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            スキップ
          </button>
        </header>

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={transitions.gentle}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-col items-center text-center">
                <span
                  className="flex size-9 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-sm font-bold text-primary"
                  aria-hidden
                >
                  {slides[current].step}
                </span>
                <h1 className="mt-5 text-balance text-[1.35rem] font-bold leading-snug tracking-tight text-mono-ink sm:text-2xl">
                  {slides[current].titleLines[0]}
                  <br />
                  {slides[current].titleLines[1]}
                </h1>
                <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-mono-ink/72">
                  {slides[current].sub}
                </p>
              </div>

              <div className="relative mt-6 flex min-h-[min(42vh,22rem)] flex-1 flex-col justify-end sm:mt-8">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.35rem] bg-mono-cream/50 shadow-elev ring-1 ring-mono-ink/6">
                  <Image
                    src={slides[current].imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 28rem) 100vw, 28rem"
                    priority={current === 0}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mono-ink/10 via-transparent to-white/10" />
                </div>

                <div className="mt-6 flex justify-center gap-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? "w-7 bg-primary"
                          : "w-2 bg-primary/25"
                      }`}
                      aria-label={`スライド ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-6 w-full max-w-sm shrink-0 self-center">
            <Button
              onClick={handleNext}
              variant="brand"
              className="h-12 w-full text-base font-medium"
              size="lg"
            >
              {isLast ? "はじめる" : "つぎへ"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
