"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "wishes" | "welcome" | "record" | "default";

const WASH: Record<Exclude<Variant, "default">, CSSProperties> = {
  wishes: {
    background: `
      radial-gradient(78% 52% at 50% 6%,
        color-mix(in oklab, oklch(0.9 0.055 78) 16%, transparent) 0%,
        transparent 56%),
      linear-gradient(185deg,
        color-mix(in oklab, oklch(0.97 0.02 72) 35%, transparent) 0%,
        transparent 52%)
    `,
  },
  welcome: {
    background: `
      radial-gradient(72% 55% at 50% 8%,
        color-mix(in oklab, var(--primary) 7.5%, transparent) 0%,
        transparent 58%),
      linear-gradient(188deg,
        color-mix(in oklab, var(--secondary) 5.5%, transparent) 0%,
        transparent 50%)
    `,
  },
  record: {
    background: `
      radial-gradient(68% 50% at 18% 6%,
        color-mix(in oklab, var(--accent) 6.5%, transparent) 0%,
        transparent 60%),
      linear-gradient(192deg,
        transparent 0%,
        color-mix(in oklab, var(--primary) 3.2%, transparent) 100%)
    `,
  },
};

/**
 * AppBackground 上に重ねるルート専用の薄いウォッシュ（1 系統の彩）。
 * 濁りを防ぐため副ブロブは置かず、radial + 淡い縦グラデのみ。
 */
export function RouteAtmosphere({
  variant = "default",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "default") return null;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 -z-20 h-[58vh] overflow-hidden",
        className,
      )}
      style={WASH[variant]}
    />
  );
}
