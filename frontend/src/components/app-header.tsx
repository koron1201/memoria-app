/**
 * AppHeader
 *
 * 上端：ニュートラルな霧＋低コントラスト境界。
 * ブランド表記は字間重視（大文字太チップ化を避ける）
 */
import { cn } from "@/lib/utils";

export interface AppHeaderProps {
  date?: string;
  eyebrow?: string;
}

export function AppHeader({ date, eyebrow }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/6 pt-safe shell-surface">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, white 5%, transparent) 0%, transparent 85%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-3.5 pt-4">
        <div className="flex items-end justify-between gap-6">
          <div className="flex min-w-0 flex-col leading-tight">
            {eyebrow && (
              <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground/75">
                {eyebrow}
              </span>
            )}
            <time className="mt-1.5 text-[13px] font-semibold tabular-nums tracking-tight text-foreground/88">
              {date}
            </time>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="size-9 shrink-0 rounded-full bg-gradient-to-br from-[#e8c4b8] via-mono-moss/90 to-mono-sage shadow-soft ring-1 ring-white/60"
            />
            <span
              className={cn(
                "text-[1.05rem] font-bold leading-none tracking-tight text-mono-ink",
                "[font-family:var(--font-noto-serif),ui-serif,serif]",
              )}
              aria-label="MonoLog"
            >
              MonoLog
            </span>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--foreground) 7%, white) 14%, color-mix(in oklab, var(--foreground) 4%, white) 50%, color-mix(in oklab, var(--foreground) 7%, white) 86%, transparent 100%)",
        }}
        aria-hidden
      />
    </header>
  );
}
