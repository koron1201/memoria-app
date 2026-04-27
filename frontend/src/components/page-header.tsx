"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** タイトル下の補足（1行目は通常タイトル、2行目に淡いテキスト） */
  subline?: string;
  showBack?: boolean;
  className?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({
  title,
  subline,
  showBack = false,
  className,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-foreground/6",
        "shell-surface",
        className
      )}
    >
      <div
        className="flex items-start justify-between gap-2 px-4 py-2.5"
        style={{ minHeight: "3.25rem" }}
      >
        <div className="flex min-w-0 flex-1 items-start gap-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground/90"
              aria-label="戻る"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="min-w-0 flex-1">
            {title.trim() !== "" && (
              <h1 className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-foreground/92">
                {title}
              </h1>
            )}
            {subline && (
              <p
                className={cn(
                  "text-[12px] leading-relaxed text-muted-foreground/90",
                  title.trim() !== "" && "mt-1",
                )}
              >
                {subline}
              </p>
            )}
          </div>
        </div>
        {rightAction && <div className="shrink-0 pt-0.5">{rightAction}</div>}
      </div>
      <div
        className="pointer-events-none h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--foreground) 6%, white) 50%, transparent 100%)",
        }}
        aria-hidden
      />
    </header>
  );
}
