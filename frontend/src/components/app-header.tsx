/**
 * AppHeader
 *
 * 画面上部の sticky ヘッダー。
 * - 背景は backdrop-blur（var(--header-blur)）
 * - 下辺は max-w-6xl の範囲にのみ、左右フェードするヘアラインを1px
 * - 日付は tabular-nums + 曜日の前後に薄い区切り
 * - ブランドチップは inset 1px のハイライトで面を起こす
 */
export interface AppHeaderProps {
  date?: string;
  /** 日付の右に並べる小さな補助テキスト（例: "今日の記録"） */
  eyebrow?: string;
}

export function AppHeader({ date, eyebrow }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full pt-safe"
      style={{ backdropFilter: `blur(var(--header-blur))` }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,250,254,0.72) 0%, rgba(250,250,254,0.32) 85%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            {eyebrow && (
              <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground/75">
                {eyebrow}
              </span>
            )}
            <time className="mt-0.5 text-[12px] font-medium tabular-nums text-muted-foreground/90">
              {date}
            </time>
          </div>

          <span
            className="inset-highlight rounded-full border border-white/60 bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/85 backdrop-blur"
            aria-label="MEMORIA"
          >
            MEMORIA
          </span>
        </div>
      </div>

      {/* 髪糸ヘアライン：max-w-6xl の内側のみ、両端フェード */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        aria-hidden
      >
        <div
          className="mx-auto h-full max-w-6xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 18%, rgba(184,169,232,0.35) 50%, rgba(255,255,255,0.6) 82%, transparent 100%)",
          }}
        />
      </div>
    </header>
  );
}
