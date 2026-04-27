"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

/**
 * アイコンレスのピル型トグル。
 * - role="switch" + aria-checked でアクセシブル
 * - on 時に primary グロー、内側ハイライトで Liquid 質感
 * - prefers-reduced-motion でも translate のみ短時間で許容範囲
 */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ease-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none",
        checked ? "bg-primary/85" : "bg-foreground/12",
      )}
      style={{
        boxShadow: checked
          ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 18px color-mix(in oklab, var(--primary) 26%, transparent)"
          : "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(32,20,80,0.05)",
      }}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-white transition-transform duration-300 ease-out",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        )}
        style={{
          boxShadow: "0 2px 6px rgba(32,20,80,0.18)",
        }}
      />
    </button>
  );
}
