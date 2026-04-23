"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/motion";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ステート管理
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 写真を選択した時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // ブラウザに表示するためのURLを作成
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // 解析ボタンを押した時の処理
  const handleAnalyze = async () => {
    if (!file) {
      alert("写真を選択してください✨");
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

      localStorage.setItem("last_analysis", JSON.stringify(result));
      if (previewUrl) localStorage.setItem("last_image", previewUrl);

      // 結果表示ページへ
      router.push("/memory"); 
    } catch (error) {
      console.error(error);
      alert("AI解析中にエラーが発生しました。バックエンドが動いているか確認してね！");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div {...pageTransition}>
      <PageHeader title="思い出を記録する" showBack />

      <div className="flex flex-col items-center gap-6 px-5 pt-6">
        {/* 実際のファイル選択（隠しておく） */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* 写真選択エリア */}
        <GlassCard 
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex w-full max-w-sm flex-col items-center justify-center gap-4 border-2 border-dashed border-[#B8A9E8]/30 bg-gradient-to-br from-[#B8A9E8]/5 to-[#F2B5D4]/5 transition-all hover:bg-[#B8A9E8]/10 cursor-pointer overflow-hidden ${
            previewUrl ? "p-0 aspect-[4/3] border-none" : "py-10"
          }`}
        >
          {previewUrl ? (
            <div className="relative h-full w-full min-h-48">
              <Image
                src={previewUrl}
                alt="プレビュー"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            /* 写真が未選択の時：いつものアイコンを表示 */
            <>
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#B8A9E8]/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B8A9E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">写真を選択</p>
                <p className="mt-1 text-xs text-muted-foreground">タップして写真を選ぶ</p>
              </div>
            </>
          )}
        </GlassCard>

        {/* テキスト入力 */}
        <div className="w-full max-w-sm">
          <label className="mb-2 block text-sm font-medium">ひとこと日記</label>
          <textarea
            placeholder="今日はどんな日だった？"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none rounded-2xl border border-border bg-white/60 p-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground/50 focus:border-[#B8A9E8] focus:outline-none focus:ring-2 focus:ring-[#B8A9E8]/20"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          // 「解析中」または「写真がない」または「文字入力がない」ときに無効化
          disabled={isAnalyzing || !file || !text.trim()} 
          className="h-12 w-full max-w-sm rounded-2xl bg-[#B8A9E8] text-base font-medium text-white hover:bg-[#a898d8] disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          ✨ 解析する
        </Button>
      </div>
    </motion.div>
  );
}
