import { cn } from "@/lib/utils";

interface SectionProps {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * マイページの編集可読ブロック用ヘッダ + コンテンツ枠。
 *
 *  ┌ 01 ── PROFILE ─────────────────────
 *  │
 *  │  ニックネーム
 *  │  他の人に表示される名前です。
 *  │
 *  │  [content]
 *
 * - 番号ラベル（mono / primary）+ 英字 eyebrow（uppercase tracking）
 * - 右に伸びる 1px の primary グラデ下線で区切り
 * - 装飾アイコンは使わず、字間と階層で構造化する
 */
export function Section({
  number,
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("group/section", className)}>
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-primary">
          {number}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground/85">
          {eyebrow}
        </span>
        <span
          aria-hidden
          className="ml-1 h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--primary) 28%, transparent) 0%, transparent 100%)",
          }}
        />
      </div>

      <div className="mb-5 px-1">
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}
