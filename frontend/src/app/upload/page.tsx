"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition, transitions } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { APP_LS } from "@/lib/app-local-storage";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = ["写真解析", "感情分析", "文章理解", "動物選定"] as const;

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState(
    "お気に入りのカフェで、ゆっくり読書ができた。心が落ち着いた時間だった。",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setStepIndex(0);
      return;
    }
    setStepIndex(0);
    const t = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 720);
    return () => clearInterval(t);
  }, [isAnalyzing]);

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("写真を選んでください");
      return;
    }
    if (!text.trim()) {
      alert("ひとことを入力してください");
      return;
    }

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("text", text);

    try {
      const res = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("解析に失敗しました");

      const result = await res.json();

      localStorage.setItem(APP_LS.lastAnalysis, JSON.stringify(result));
      if (previewUrl) localStorage.setItem(APP_LS.lastImage, previewUrl);

      // バックエンドから返ってきたIDがあればそれを使う。なければ一覧へ。
      if (result.id) {
        router.push(`/memory/${result.id}`); 
      } else {
        router.push("/memory");
      }
    } catch (error) {
      console.error(error);
      alert("AI解析中にエラーが発生しました。バックエンドが動いているか確認してください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <RouteAtmosphere variant="record" />
      <motion.div {...pageTransition} className="relative">
        <PageHeader
          title="思い出を記録する"
          subline="写真を選んで、ひとこと書いてみましょう。"
          showBack
        />

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-end justify-center bg-mono-ink/20 px-4 pb-8 pt-6 backdrop-blur-[3px] sm:items-center sm:pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.default}
              role="status"
              aria-live="polite"
              aria-label="AIが解析中です"
            >
              <GlassCard className="w-full max-w-sm border border-white/45 bg-mono-paper/85 p-4 shadow-elev sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-foreground">
                      解析中…
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      あなたの感情を読み取っています
                    </p>
                  </div>
                  <div
                    className="relative grid size-[4.5rem] shrink-0 place-content-center"
                    style={{
                      background: `conic-gradient(var(--primary) 68%, color-mix(in oklab, var(--muted) 80%, white) 0)`,
                      borderRadius: "9999px",
                    }}
                  >
                    <div className="grid size-14 place-content-center rounded-full bg-mono-paper text-base font-bold tabular-nums text-primary">
                      68%
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-foreground/8 pt-4">
                  <div className="relative px-0.5">
                    <div
                      className="absolute left-[12.5%] right-[12.5%] top-2.5 h-px bg-mono-ink/10"
                      aria-hidden
                    />
                    <ol className="relative flex justify-between">
                      {ANALYSIS_STEPS.map((label, i) => {
                        const done = i < stepIndex;
                        const current = i === stepIndex;
                        return (
                          <li
                            key={label}
                            className="flex max-w-[22%] flex-col items-center gap-1.5 text-center"
                          >
                            <span
                              className={cn(
                                "relative z-10 size-2.5 rounded-full ring-2 ring-offset-1 ring-offset-mono-paper",
                                done && "bg-primary ring-primary/40",
                                current &&
                                  "bg-mono-paper ring-primary ring-2",
                                !done &&
                                  !current &&
                                  "bg-mono-paper ring-mono-ink/20",
                              )}
                            />
                            <span className="text-[9px] font-medium leading-tight text-muted-foreground [word-break:keep-all]">
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-5 pt-2 pb-8">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <GlassCard
            onClick={previewUrl ? undefined : openPicker}
            className={cn(
              "relative flex w-full flex-col items-center justify-center overflow-hidden p-0 transition-all",
              !previewUrl &&
                "min-h-44 cursor-pointer border-2 border-dashed border-primary/30 bg-gradient-to-br from-mono-moss/8 to-mono-cream/40 py-10 hover:border-primary/45",
              previewUrl && "aspect-[4/3] max-h-[16rem] cursor-default border-0",
            )}
          >
            {previewUrl ? (
              <>
                <div className="relative h-full w-full min-h-48">
                  <Image
                    src={previewUrl}
                    alt="プレビュー"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPhoto();
                  }}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-white/50 bg-mono-ink/35 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-mono-ink/50"
                  aria-label="写真を削除"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <div className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2">
                  <button
                    type="button"
                    onClick={openPicker}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-mono-paper/75 px-3 py-1.5 text-xs font-medium text-mono-ink shadow-ambient backdrop-blur-md"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    写真を変更
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">写真を選択</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    タップして写真を選ぶ
                  </p>
                </div>
              </>
            )}
          </GlassCard>

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-foreground/90">
              ひとこと（どんな出来事でしたか？）
            </label>
            <div className="relative">
              <textarea
                placeholder="今日の出来事を短く"
                rows={4}
                maxLength={200}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full resize-none rounded-2xl border border-mono-ink/10 bg-mono-paper/90 pb-7 pl-3.5 pr-3.5 pt-3 text-sm leading-relaxed shadow-ambient [box-shadow:inset_0_1px_0_rgba(255,255,255,0.65)] placeholder:text-muted-foreground/45 focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums text-muted-foreground/85">
                {text.length}/200
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-1.5">
            <Button
              onClick={handleAnalyze}
              variant="brand"
              disabled={isAnalyzing || !file || !text.trim()}
              className="h-12 w-full text-base font-medium disabled:cursor-not-allowed disabled:opacity-50"
              size="lg"
            >
              {isAnalyzing ? "解析中…" : "AIで解析する"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground/85">
              解析には数十秒かかります
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
