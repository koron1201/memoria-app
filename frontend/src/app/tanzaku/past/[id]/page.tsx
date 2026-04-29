"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { pageTransition, transitions } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { PAST_TANZAKU_ITEMS } from "@/lib/past-tanzaku";

/** 達成証拠のデモデータ（本番は API から取得） */
const ACHIEVEMENT_DATA: Record<
  string,
  { achieved: boolean; achievedDate?: string; evidenceNote?: string }
> = {
  "1": {
    achieved: true,
    achievedDate: "2025年4月15日",
    evidenceNote:
      "ブログで初投稿を達成。読者から「心に響いた」とコメントをもらいました。",
  },
  "2": {
    achieved: true,
    achievedDate: "2025年3月28日",
    evidenceNote:
      "12週連続で毎週1冊読了を達成。読書ノートが計12ページになりました。",
  },
  "3": {
    achieved: true,
    achievedDate: "2025年2月14日",
    evidenceNote:
      "バレンタインに家族全員に手紙を書きました。涙を流して喜んでくれました。",
  },
  "4": {
    achieved: true,
    achievedDate: "2025年1月31日",
    evidenceNote:
      "1ヶ月間、週5日の朝散歩を継続。歩数ログで達成を確認しました。",
  },
  "5": {
    achieved: true,
    achievedDate: "2024年12月20日",
    evidenceNote: "FP3級に一発合格！合格証書を受け取りました。",
  },
  "6": {
    achieved: true,
    achievedDate: "2024年11月30日",
    evidenceNote:
      "InstagramにPhotoBookアルバムを3ヶ月連続で投稿しました。",
  },
  "7": {
    achieved: true,
    achievedDate: "2024年10月27日",
    evidenceNote:
      "毎週日曜日に家族と一緒に料理を作る習慣ができました。レシピノートが増えています。",
  },
  "8": {
    achieved: true,
    achievedDate: "2024年9月15日",
    evidenceNote: "30日連続で音読を記録。録音メモで発音の変化も確認できました。",
  },
  "9": {
    achieved: true,
    achievedDate: "2024年8月15日",
    evidenceNote:
      "断捨離を完了し、部屋がすっきり。ビフォーアフターの写真で記録しました。",
  },
  "10": {
    achieved: true,
    achievedDate: "2024年7月21日",
    evidenceNote: "絵日記を1冊分描き切りました。最初のページから成長が見えます。",
  },
  "11": {
    achieved: true,
    achievedDate: "2024年6月10日",
    evidenceNote:
      "読書会で出会った方と友人に。今でも月1回カフェで会っています。",
  },
  "12": {
    achieved: true,
    achievedDate: "2024年5月3日",
    evidenceNote:
      "長野県の阿智村で満天の星空を見ました。人生最高の夜でした。",
  },
};

export default function TanzakuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const item = PAST_TANZAKU_ITEMS.find((t) => t.id === id);
  const achievement = ACHIEVEMENT_DATA[id];

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        短冊が見つかりません
      </div>
    );
  }

  const achieved = achievement?.achieved ?? false;

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader title="短冊" showBack />

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-5 pt-2 pb-10">
          {/* ——— 短冊カード ——— */}
          <div className="relative w-full py-2">
            {/* 背景グロー */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[#d4a574]/15 blur-3xl"
              aria-hidden
            />

            <div className="relative mx-auto flex w-full max-w-[14rem] flex-col items-center">
              <div
                className="relative flex w-full flex-col items-center"
                style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
              >
                {/* 紐の結び目 */}
                <div
                  className="mb-0 flex h-5 w-10 items-end justify-center"
                  aria-hidden
                >
                  <div
                    className="h-4 w-4 rounded-b-full border border-rose-300/90 border-t-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #fecaca55 0%, #fda4af88 100%)",
                    }}
                  />
                </div>

                {/* 和紙風短冊 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.gentle}
                  className="relative w-full overflow-hidden rounded-2xl border border-amber-900/8 bg-gradient-to-b from-[#fffcf4] to-[#f0e4d2] px-4 pb-6 pt-4 shadow-elev [box-shadow:inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  {/* 紐の接続点 */}
                  <div className="mx-auto h-1 w-7 rounded-b-full bg-[#8b6b4a]/15" />

                  {/* 願い本文（縦書き風） */}
                  <div className="mt-4 flex min-h-[16rem] w-full items-center justify-center px-1">
                    <p
                      className="max-h-full text-xl font-semibold leading-[2.2] tracking-wide text-[#3d3730] sm:text-[1.35rem] sm:leading-[2.1]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {item.text}
                    </p>
                  </div>

                  {/* 日付 */}
                  <p className="mt-3 text-center text-xs text-[#8b7355]/80">
                    {item.date}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ——— 達成証拠エリア ——— */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.2 }}
            className="w-full"
          >
            <div
              className={`rounded-2xl border p-5 backdrop-blur-md ${
                achieved
                  ? "border-emerald-300/40 bg-gradient-to-br from-emerald-50/60 via-white/50 to-amber-50/30 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
                  : "border-amber-300/30 bg-gradient-to-br from-amber-50/50 via-white/50 to-orange-50/20 shadow-[0_8px_32px_rgba(245,158,11,0.06)]"
              }`}
              style={{
                boxShadow: achieved
                  ? "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 32px rgba(16,185,129,0.08)"
                  : "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 32px rgba(245,158,11,0.06)",
              }}
            >
              {/* バッジ */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${
                    achieved
                      ? "bg-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                      : "bg-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.25)]"
                  }`}
                >
                  {achieved ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12l4 4L20 7" />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2
                    className={`text-base font-bold ${
                      achieved ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {achieved ? "🎉 願いが叶いました！" : "⏳ 挑戦中…"}
                  </h2>
                  {achievement?.achievedDate && (
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      達成日: {achievement.achievedDate}
                    </p>
                  )}
                </div>
              </div>

              {/* 証拠メッセージ */}
              {achievement?.evidenceNote && (
                <div className="mt-4 rounded-xl border border-white/50 bg-white/45 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground/70">
                    {achieved ? "達成の証拠" : "現在の状況"}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {achievement.evidenceNote}
                  </p>
                </div>
              )}

              {/* 叶った場合の装飾 */}
              {achieved && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-3 py-1 text-[11px] font-medium text-emerald-600">
                    <span aria-hidden>✨</span>
                    完了した願い
                    <span aria-hidden>✨</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 戻るリンク */}
          <Link
            href="/tanzaku/past"
            className="text-sm font-medium text-primary/90 underline-offset-4 hover:underline"
          >
            ← 過去の短冊一覧に戻る
          </Link>
        </div>
      </motion.div>
    </>
  );
}
