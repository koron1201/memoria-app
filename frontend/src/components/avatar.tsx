"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** 表示する画像 URL（data URL 可）。未指定ならプレースホルダー */
  src?: string | null;
  /** オンのとき、タップでファイル選択。`onFileSelect` に File を渡す */
  editable?: boolean;
  onFileSelect?: (file: File) => void;
}

const sizeMap = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

export function Avatar({
  size = "md",
  className,
  src,
  editable = false,
  onFileSelect,
}: AvatarProps) {
  const inputId = useId();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFileSelect?.(file);
  }

  const circle = (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-mono-moss/35 via-mono-cream/40 to-mono-sand/25",
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <>
          <div
            className={cn(
              "absolute inset-1 rounded-full bg-gradient-to-br from-mono-sage via-mono-moss to-mono-sand opacity-25 blur-md",
            )}
          />
          <svg
            viewBox="0 0 100 100"
            className={cn("relative z-10", {
              "size-10": size === "sm",
              "size-16": size === "md",
              "size-20": size === "lg",
            })}
            aria-hidden
          >
            <circle cx="50" cy="38" r="18" fill="var(--mono-sage)" />
            <circle cx="43" cy="34" r="2.5" fill="white" />
            <circle cx="57" cy="34" r="2.5" fill="white" />
            <path
              d="M45 42 Q50 47 55 42"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="50" cy="72" rx="22" ry="18" fill="var(--mono-moss)" />
          </svg>
        </>
      )}
    </div>
  );

  if (!editable) {
    return circle;
  }

  return (
    <div className="flex flex-col items-center">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
      />
      <label
        htmlFor={inputId}
        className="group cursor-pointer rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background"
      >
        <span className="sr-only">プロフィール写真を{src ? "変更" : "追加"}</span>
        {circle}
      </label>
      <label
        htmlFor={inputId}
        className="mt-2 cursor-pointer text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        {src ? "写真を変更" : "写真を追加"}
      </label>
    </div>
  );
}
