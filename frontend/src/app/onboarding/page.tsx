"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { transitions } from "@/lib/motion";

const slides = [
  {
    emoji: "📷",
    title: "写真が、思い出の1ページになる",
    description: "日常の何気ない写真とひとことから、\nAIがあなただけの日記を作ります",
    gradient: "from-[#B8A9E8] to-[#F2B5D4]",
  },
  {
    emoji: "🐱",
    title: "感情が、動物になる",
    description: "あなたの感情をAIが読み取り、\n動物キャラクターとして表現します",
    gradient: "from-[#F2B5D4] to-[#89CFF0]",
  },
  {
    emoji: "⭐",
    title: "夢が、ロードマップになる",
    description: "短冊に書いた夢を\nAIが具体的なステップに変えてくれます",
    gradient: "from-[#89CFF0] to-[#B8A9E8]",
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
    <div className="flex min-h-dvh flex-col items-center justify-between px-6 py-12">
      {/* スライドコンテンツ */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={transitions.gentle}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div
              className={`flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br ${slides[current].gradient} shadow-lg`}
            >
              <span className="text-5xl">{slides[current].emoji}</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug">
              {slides[current].title}
            </h1>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* インジケーター + ボタン */}
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        {/* ドットインジケーター */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-[#B8A9E8]"
                  : "w-2 bg-[#B8A9E8]/30"
              }`}
              aria-label={`スライド ${i + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="h-12 w-full rounded-2xl bg-[#B8A9E8] text-base font-medium text-white hover:bg-[#a898d8]"
          size="lg"
        >
          {isLast ? "はじめる" : "次へ"}
        </Button>

        {isLast && (
          <Button
            variant="ghost"
            className="h-10 w-full rounded-2xl text-sm text-muted-foreground"
            onClick={() => router.push("/")}
          >
            Googleアカウントでログイン
          </Button>
        )}

        {!isLast && (
          <button
            onClick={() => router.push("/")}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}
