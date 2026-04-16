"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  className?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({
  title,
  showBack = false,
  className,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/20 bg-white/70 px-4 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/30"
            aria-label="戻る"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-medium">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
