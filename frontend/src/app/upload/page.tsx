"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, PenLine, RefreshCw, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition, transitions } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { APP_LS } from "@/lib/app-local-storage";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = ["写真を読む", "気持ちを拾う", "言葉を整える", "記録にする"] as const;

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
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setStepIndex(0);
      setProgressPct(0);
      return;
    }
    setStepIndex(0);
    setProgressPct(0);
    const startedAt = performance.now();

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 720);

    const totalDuration = 720 * ANALYSIS_STEPS.length;
    const tickInterval = 50;
    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setProgressPct(Math.min(100, (elapsed / totalDuration) * 100));
    }, tickInterval);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [isAnalyzing]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const openPicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      setProgressPct(100);
      setStepIndex(ANALYSIS_STEPS.length - 1);
      await new Promise((resolve) => setTimeout(resolve, 280));

      localStorage.setItem(APP_LS.lastAnalysis, JSON.stringify(result));
      if (previewUrl) localStorage.setItem(APP_LS.lastImage, previewUrl);

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
          subline="写真を置いて、今日のひとことを添えてみましょう。"
          showBack
        />

        <AnalyzeOverlay
          isAnalyzing={isAnalyzing}
          progressPct={progressPct}
          stepIndex={stepIndex}
        />

        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-5 pb-8 pt-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <PhotoDesk
            previewUrl={previewUrl}
            onPick={openPicker}
            onClear={clearPhoto}
          />

          <section className="relative">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="grid size-7 place-items-center rounded-full bg-mono-sage/12 text-primary">
                <PenLine className="size-3.5" aria-hidden />
              </span>
              <label className="text-sm font-medium text-foreground/90">
                ひとことメモ
              </label>
            </div>
            <div className="relative overflow-hidden rounded-[1.15rem] border border-mono-linen/28 bg-[#fffdf7]/92 shadow-ambient ring-1 ring-white/50">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-[3.1rem] bottom-8 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_1.7rem,rgba(58,56,52,0.075)_1.75rem)]"
              />
              <textarea
                placeholder="今日はどんな出来事でしたか？"
                rows={5}
                maxLength={200}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="relative w-full resize-none bg-transparent pb-8 pl-4 pr-4 pt-4 text-sm leading-[1.75rem] text-mono-ink outline-none placeholder:text-muted-foreground/45"
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums text-muted-foreground/85">
                {text.length}/200
              </span>
            </div>
          </section>

          <div className="flex w-full flex-col items-center gap-1.5">
            <Button
              onClick={handleAnalyze}
              variant="brand"
              disabled={isAnalyzing || !file || !text.trim()}
              className="h-12 w-full text-base font-medium disabled:cursor-not-allowed disabled:opacity-50"
              size="lg"
            >
              <Sparkles className="size-4" aria-hidden />
              {isAnalyzing ? "記録を整えています" : "AIで記録を整える"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground/85">
              写真とメモから、思い出のページを作ります。
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function PhotoDesk({
  previewUrl,
  onPick,
  onClear,
}: {
  previewUrl: string | null;
  onPick: (e?: React.MouseEvent) => void;
  onClear: () => void;
}) {
  return (
    <GlassCard className="relative overflow-hidden border-mono-linen/26 bg-[#f6efe3]/70 p-0">
      <button
        type="button"
        onClick={previewUrl ? undefined : onPick}
        className={cn(
          "relative block min-h-[18rem] w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
          !previewUrl && "cursor-pointer",
        )}
        aria-label={previewUrl ? "選択した写真" : "写真を選ぶ"}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.46),transparent_44%),repeating-linear-gradient(0deg,rgba(58,56,52,0.035)_0,rgba(58,56,52,0.035)_1px,transparent_1px,transparent_28px)]"
        />
        <div className="absolute left-5 top-5 h-8 w-20 rotate-[-8deg] rounded-[0.35rem] bg-mono-blush/16 ring-1 ring-mono-blush/16" />
        <div className="absolute right-7 top-7 h-7 w-16 rotate-[7deg] rounded-[0.35rem] bg-mono-sage/16 ring-1 ring-mono-sage/16" />

        <div className="absolute bottom-7 right-8 h-28 w-3 rotate-[33deg] rounded-full bg-[#786348] shadow-ambient">
          <div className="absolute -top-4 left-1/2 h-5 w-3 -translate-x-1/2 rounded-t-full bg-mono-sand" />
          <div className="absolute bottom-1 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-[#f0e5d6]" />
        </div>
        <div className="absolute bottom-6 right-5 h-11 w-11 rounded-full border border-mono-linen/24 bg-white/35" />

        <div className="relative z-10 flex min-h-[18rem] items-center justify-center px-6 py-9">
          {previewUrl ? (
            <div className="relative w-[82%] rotate-[-2.5deg] rounded-[0.75rem] bg-white p-2.5 shadow-elev ring-1 ring-mono-ink/8">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[0.45rem] bg-mono-cream">
                <Image
                  src={previewUrl}
                  alt="プレビュー"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="h-2 w-24 rounded-full bg-mono-linen/32" />
                <span className="h-2 w-10 rounded-full bg-mono-sage/22" />
              </div>
            </div>
          ) : (
            <div className="relative w-[82%] rotate-[-2deg] rounded-[0.75rem] border border-dashed border-mono-sage/35 bg-white/62 p-5 text-center shadow-soft ring-1 ring-white/60">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-mono-sage/12 text-primary">
                <Camera className="size-6" aria-hidden />
              </div>
              <p className="mt-4 text-sm font-semibold text-mono-ink">
                写真をここに置く
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                タップして写真を選びます
              </p>
            </div>
          )}
        </div>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-4">
        {previewUrl ? (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/65 bg-mono-paper/82 p-1.5 shadow-soft backdrop-blur-md">
            <button
              type="button"
              onClick={onPick}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-mono-ink transition hover:bg-white/65"
            >
              <RefreshCw className="size-3.5" aria-hidden />
              変更
            </button>
            <button
              type="button"
              onClick={onClear}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/65 hover:text-foreground"
              aria-label="写真を削除"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPick}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-mono-paper/82 px-4 py-2 text-xs font-semibold text-primary shadow-soft backdrop-blur-md transition hover:bg-white"
          >
            <ImagePlus className="size-3.5" aria-hidden />
            写真を選ぶ
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function AnalyzeOverlay({
  isAnalyzing,
  progressPct,
  stepIndex,
}: {
  isAnalyzing: boolean;
  progressPct: number;
  stepIndex: number;
}) {
  return (
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
          aria-label="記録を整えています"
        >
          <GlassCard className="w-full max-w-sm border border-white/45 bg-mono-paper/88 p-4 shadow-elev sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground">
                  ページを整えています
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  AIが写真とメモから、今日の空気を読み取っています。
                </p>
              </div>
              <div
                className="relative grid size-[4.5rem] shrink-0 place-content-center"
                style={{
                  background: `conic-gradient(var(--primary) ${Math.round(progressPct)}%, color-mix(in oklab, var(--muted) 80%, white) 0)`,
                  borderRadius: "9999px",
                }}
              >
                <div className="grid size-14 place-content-center rounded-full bg-mono-paper text-base font-bold tabular-nums text-primary">
                  {Math.round(progressPct)}%
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
                            current && "bg-mono-paper ring-2 ring-primary",
                            !done && !current && "bg-mono-paper ring-mono-ink/20",
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
  );
}
